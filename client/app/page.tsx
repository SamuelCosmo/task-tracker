import TaskList from './TaskList';
import ThemeToggle from './ThemeToggle';

const API_URL = process.env.API_URL;

interface Task {
  id: number;
  title: string;
  done: boolean;
}

export default async function Home() {
  let tasks: Task[] = [];
  let loadFailed = false;

  try {
    const res = await fetch(`${API_URL}/tasks`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    tasks = await res.json();
  } catch {
    // Tier 2 (docs/design/07-empty-loading-error-states.md §7.6): one region
    // failed, the rest of the page stays usable.
    loadFailed = true;
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-h1 text-text-primary">Task Tracker</h1>
        <ThemeToggle />
      </header>

      {loadFailed ? (
        <p className="rounded-lg border border-border bg-surface p-4 text-body text-error-strong shadow-card">
          Couldn&apos;t load your tasks. Check your connection and try again.
        </p>
      ) : (
        <TaskList initialTasks={tasks} />
      )}
    </div>
  );
}
