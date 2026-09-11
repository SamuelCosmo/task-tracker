import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

export const prisma = new PrismaClient();

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

/// `done` is not a column. It is derived from `status` so the checkbox and the
/// status badge can never disagree, and `overdue` is derived from `dueDate` so it
/// cannot go stale the way a stored flag would.
/// Spec: docs/design/01-concept-ia-navigation.md §2.2
/// Today's *local* calendar date as YYYY-MM-DD.
/// A DATE column comes back from Prisma as UTC midnight, so comparing it against
/// a local-midnight Date is wrong by up to a day in either direction — a task due
/// today reads as overdue west of UTC. Both sides are reduced to a calendar-date
/// string instead, which ISO ordering compares correctly.
function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

function toTaskDTO(task) {
  const dueDate = task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null;
  return {
    ...task,
    dueDate,
    done: task.status === 'DONE',
    overdue: task.status !== 'DONE' && dueDate !== null && dueDate < todayISO(),
  };
}

/// Accepts a date-only string ("2026-09-11"). Anchored to UTC midnight because
/// the column is a DATE — this is what stops the value drifting a day across
/// timezones.
function parseDueDate(value) {
  if (value === null || value === '') return null;
  if (value === undefined) return undefined;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError('dueDate must be a date in YYYY-MM-DD format');
  }
  return date;
}

class ValidationError extends Error {}

/// Builds the status half of a write. `status` wins when both are supplied.
/// `completedAt` is only stamped on an actual transition into DONE, so editing a
/// completed task does not silently reset when it was finished.
function statusPatch({ status, done }, current) {
  let next;
  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      throw new ValidationError(`status must be one of ${STATUSES.join(', ')}`);
    }
    next = status;
  } else if (done !== undefined) {
    next = done ? 'DONE' : 'TODO';
  } else {
    return {};
  }

  if (current && current.status === next) return { status: next };
  return { status: next, completedAt: next === 'DONE' ? new Date() : null };
}

function taskWrite(body, current) {
  const data = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) throw new ValidationError('title is required');
    data.title = title;
  }
  if (body.description !== undefined) {
    data.description = body.description === '' ? null : body.description;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      throw new ValidationError(`priority must be one of ${PRIORITIES.join(', ')}`);
    }
    data.priority = body.priority;
  }
  const dueDate = parseDueDate(body.dueDate);
  if (dueDate !== undefined) data.dueDate = dueDate;

  if (body.categoryId !== undefined) {
    data.categoryId = body.categoryId === null ? null : Number(body.categoryId);
  }

  return { ...data, ...statusPatch(body, current) };
}

const typeDefs = `#graphql
  enum TaskStatus { TODO IN_PROGRESS DONE }
  enum Priority { LOW MEDIUM HIGH }

  type Category {
    id: ID!
    name: String!
    color: String!
    icon: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    priority: Priority!
    dueDate: String
    categoryId: Int
    category: Category
    createdAt: String!
    updatedAt: String!
    completedAt: String
    "Derived from status == DONE. Not stored."
    done: Boolean!
    "Derived from dueDate < today AND status != DONE. Not stored."
    overdue: Boolean!
  }

  type Query {
    tasks: [Task!]!
    task(id: ID!): Task
    categories: [Category!]!
  }

  type Mutation {
    addTask(
      title: String!
      description: String
      status: TaskStatus
      priority: Priority
      dueDate: String
      categoryId: Int
    ): Task!
    updateTask(
      id: ID!
      title: String
      description: String
      status: TaskStatus
      priority: Priority
      dueDate: String
      categoryId: Int
      done: Boolean
    ): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

const taskInclude = { category: true };

const resolvers = {
  Query: {
    tasks: async () =>
      (await prisma.task.findMany({ include: taskInclude })).map(toTaskDTO),
    task: async (_, { id }) => {
      const task = await prisma.task.findUnique({
        where: { id: Number(id) },
        include: taskInclude,
      });
      return task ? toTaskDTO(task) : null;
    },
    categories: async () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
  },
  Mutation: {
    addTask: async (_, args) => {
      const created = await prisma.task.create({
        data: taskWrite(args),
        include: taskInclude,
      });
      return toTaskDTO(created);
    },
    updateTask: async (_, { id, ...args }) => {
      const current = await prisma.task.findUnique({ where: { id: Number(id) } });
      if (!current) throw new Error('task not found');
      const updated = await prisma.task.update({
        where: { id: Number(id) },
        data: taskWrite(args, current),
        include: taskInclude,
      });
      return toTaskDTO(updated);
    },
    deleteTask: async (_, { id }) => {
      await prisma.task.delete({ where: { id: Number(id) } });
      return true;
    },
  },
};

export async function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/tasks', async (req, res) => {
    const tasks = await prisma.task.findMany({ include: taskInclude });
    res.json(tasks.map(toTaskDTO));
  });

  app.get('/tasks/:id', async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: taskInclude,
    });
    if (!task) return res.status(404).json({ error: 'task not found' });
    res.json(toTaskDTO(task));
  });

  app.post('/tasks', async (req, res, next) => {
    try {
      if (req.body.title === undefined) {
        return res.status(400).json({ error: 'title is required' });
      }
      const created = await prisma.task.create({
        data: taskWrite(req.body),
        include: taskInclude,
      });
      res.status(201).json(toTaskDTO(created));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  });

  app.put('/tasks/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    try {
      const current = await prisma.task.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ error: 'task not found' });

      const updated = await prisma.task.update({
        where: { id },
        data: taskWrite(req.body, current),
        include: taskInclude,
      });
      res.json(toTaskDTO(updated));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'task not found' });
      }
      next(error);
    }
  });

  app.delete('/tasks/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    try {
      await prisma.task.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'task not found' });
      }
      next(error);
    }
  });

  app.get('/categories', async (req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  });

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  app.use('/graphql', expressMiddleware(apolloServer));

  return app;
}
