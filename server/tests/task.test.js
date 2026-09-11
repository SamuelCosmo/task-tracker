import request from 'supertest';
import { createApp, prisma } from '../app.js';

let app;

function isoDaysFromToday(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.$disconnect();
});

describe('REST /tasks', () => {
  test('GET /tasks returns an empty list initially', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /tasks creates a task', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Write tests' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.done).toBe(false);
  });

  test('POST /tasks without a title returns 400', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
  });

  test('POST /tasks with a whitespace-only title returns 400', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  test('PUT /tasks/:id updates a task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Old title' });
    const res = await request(app).put(`/tasks/${created.body.id}`).send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  test('PUT /tasks/:id on a missing task returns 404', async () => {
    const res = await request(app).put('/tasks/999999').send({ done: true });
    expect(res.status).toBe(404);
  });

  test('DELETE /tasks/:id removes a task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Temp task' });
    const res = await request(app).delete(`/tasks/${created.body.id}`);
    expect(res.status).toBe(204);
  });
});

describe('task defaults', () => {
  test('a new task is TODO with MEDIUM priority, no due date and no category', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Defaults' });
    expect(res.body.status).toBe('TODO');
    expect(res.body.priority).toBe('MEDIUM');
    expect(res.body.dueDate).toBeNull();
    expect(res.body.categoryId).toBeNull();
    expect(res.body.completedAt).toBeNull();
    expect(res.body.createdAt).toBeTruthy();
  });
});

describe('done is derived from status', () => {
  test('setting done=true moves status to DONE and stamps completedAt', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Finish me' });
    const res = await request(app).put(`/tasks/${created.body.id}`).send({ done: true });
    expect(res.body.status).toBe('DONE');
    expect(res.body.done).toBe(true);
    expect(res.body.completedAt).not.toBeNull();
  });

  test('setting status=DONE directly also reports done=true', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Direct' });
    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ status: 'DONE' });
    expect(res.body.done).toBe(true);
  });

  test('reopening clears completedAt', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Reopen me' });
    await request(app).put(`/tasks/${created.body.id}`).send({ done: true });
    const res = await request(app).put(`/tasks/${created.body.id}`).send({ done: false });
    expect(res.body.status).toBe('TODO');
    expect(res.body.done).toBe(false);
    expect(res.body.completedAt).toBeNull();
  });

  test('IN_PROGRESS is not done', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Working' });
    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ status: 'IN_PROGRESS' });
    expect(res.body.done).toBe(false);
    expect(res.body.completedAt).toBeNull();
  });

  test('editing an already-completed task does not reset completedAt', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Done once' });
    const done = await request(app).put(`/tasks/${created.body.id}`).send({ done: true });
    const edited = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ title: 'Renamed', status: 'DONE' });
    expect(edited.body.completedAt).toBe(done.body.completedAt);
  });

  test('an invalid status returns 400', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Bad status' });
    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ status: 'ARCHIVED' });
    expect(res.status).toBe(400);
  });
});

describe('due dates and overdue', () => {
  test('a due date round-trips as a plain date string', async () => {
    const due = isoDaysFromToday(3);
    const res = await request(app).post('/tasks').send({ title: 'Due soon', dueDate: due });
    expect(res.body.dueDate).toBe(due);
    expect(res.body.overdue).toBe(false);
  });

  test('a past due date on an open task is overdue', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Late', dueDate: isoDaysFromToday(-2) });
    expect(res.body.overdue).toBe(true);
  });

  test('a past due date on a completed task is not overdue', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Late but done', dueDate: isoDaysFromToday(-2) });
    const res = await request(app).put(`/tasks/${created.body.id}`).send({ done: true });
    expect(res.body.overdue).toBe(false);
  });

  test('a task due today is not overdue', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Due today', dueDate: isoDaysFromToday(0) });
    expect(res.body.overdue).toBe(false);
  });

  test('a due date can be cleared', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Unschedule me', dueDate: isoDaysFromToday(1) });
    const res = await request(app).put(`/tasks/${created.body.id}`).send({ dueDate: null });
    expect(res.body.dueDate).toBeNull();
  });

  test('a malformed due date returns 400', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Bad date', dueDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });
});

describe('categories', () => {
  test('GET /categories returns categories sorted by name', async () => {
    await prisma.category.createMany({
      data: [
        { name: 'Work', color: 'indigo', icon: 'briefcase' },
        { name: 'Health', color: 'emerald', icon: 'heart' },
      ],
    });
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(res.body.map((c) => c.name)).toEqual(['Health', 'Work']);
  });

  test('a task can be assigned a category and returns it expanded', async () => {
    const category = await prisma.category.create({
      data: { name: 'Work', color: 'indigo', icon: 'briefcase' },
    });
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Categorised', categoryId: category.id });
    expect(res.body.categoryId).toBe(category.id);
    expect(res.body.category.name).toBe('Work');
  });

  test('deleting a category moves its tasks to Uncategorized rather than deleting them', async () => {
    const category = await prisma.category.create({
      data: { name: 'Work', color: 'indigo', icon: 'briefcase' },
    });
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Survives', categoryId: category.id });

    await prisma.category.delete({ where: { id: category.id } });

    const res = await request(app).get(`/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.categoryId).toBeNull();
  });
});

describe('GraphQL', () => {
  async function gql(query, variables) {
    return request(app).post('/graphql').send({ query, variables });
  }

  test('tasks query exposes derived done and overdue', async () => {
    await request(app)
      .post('/tasks')
      .send({ title: 'Late', dueDate: isoDaysFromToday(-1) });

    const res = await gql('{ tasks { title status done overdue priority } }');
    expect(res.status).toBe(200);
    expect(res.body.data.tasks).toHaveLength(1);
    expect(res.body.data.tasks[0]).toMatchObject({
      title: 'Late',
      status: 'TODO',
      done: false,
      overdue: true,
      priority: 'MEDIUM',
    });
  });

  test('addTask accepts the new fields', async () => {
    const res = await gql(
      `mutation($title: String!, $priority: Priority, $dueDate: String) {
         addTask(title: $title, priority: $priority, dueDate: $dueDate) {
           title priority dueDate done
         }
       }`,
      { title: 'From GraphQL', priority: 'HIGH', dueDate: isoDaysFromToday(2) },
    );
    expect(res.body.data.addTask).toMatchObject({
      title: 'From GraphQL',
      priority: 'HIGH',
      done: false,
    });
  });

  test('updateTask with done=true sets status to DONE', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Toggle' });
    const res = await gql(
      `mutation($id: ID!) { updateTask(id: $id, done: true) { status done } }`,
      { id: String(created.body.id) },
    );
    expect(res.body.data.updateTask).toMatchObject({ status: 'DONE', done: true });
  });
});
