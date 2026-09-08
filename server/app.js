import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

export const prisma = new PrismaClient();

const typeDefs = `#graphql
  type Task {
    id: ID!
    title: String!
    done: Boolean!
  }

  type Query {
    tasks: [Task!]!
  }

  type Mutation {
    addTask(title: String!): Task!
    updateTask(id: ID!, title: String, done: Boolean): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    tasks: async () => prisma.task.findMany(),
  },
  Mutation: {
    addTask: async (_, { title }) => prisma.task.create({ data: { title } }),
    updateTask: async (_, { id, title, done }) =>
      prisma.task.update({
        where: { id: Number(id) },
        data: {
          ...(title !== undefined && { title }),
          ...(done !== undefined && { done }),
        },
      }),
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
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  });

  app.post('/tasks', async (req, res) => {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    const newTask = await prisma.task.create({ data: { title } });
    res.status(201).json(newTask);
  });

  app.put('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { title, done } = req.body;
    try {
      const updated = await prisma.task.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(done !== undefined && { done }),
        },
      });
      res.json(updated);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'task not found' });
      }
      throw error;
    }
  });

  app.delete('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      await prisma.task.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'task not found' });
      }
      throw error;
    }
  });

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  app.use('/graphql', expressMiddleware(apolloServer));

  return app;
}