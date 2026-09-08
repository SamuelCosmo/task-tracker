import TaskList from './TaskList';

const API_URL = process.env.API_URL;

interface Task {
  id: number;
  title: string;
  done: boolean;
}

export default async function Home() {
  const res = await fetch(`${API_URL}/tasks`, { cache: 'no-store' });
  const tasks: Task[] = await res.json();

  return (
    <div>
      <h1>Task Tracker</h1>
      <TaskList initialTasks={tasks} />
    </div>
  );
}