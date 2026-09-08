import request from 'supertest';
import { createApp, prisma } from '../app.js';

let app;

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await prisma.task.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
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