import TaskList from './TaskList';
import { TopBar } from '@/components/organisms';
import { getTasks } from '@/lib/api';
import type { Task } from '@/lib/tasks';

/* Placeholder until the Phase 4 Dashboard lands. The shell around it is real. */
export default async function Home() {
  let tasks: Task[] = [];
  let loadFailed = false;

  try {
    tasks = await getTasks();
  } catch {
    // Tier 2 (docs/design/07-empty-loading-error-states.md §7.6): one region
    // failed, the rest of the page stays usable.
    loadFailed = true;
  }

  return (
    <>
      <TopBar title="Home">
        <span className="text-h1 text-text-primary">Task Tracker</span>
      </TopBar>
      <main className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-6 lg:px-8">
        {loadFailed ? (
          <p className="rounded-lg border border-border bg-surface p-4 text-body text-error-strong shadow-card">
            Couldn&apos;t load your tasks. Check your connection and try again.
          </p>
        ) : (
          <TaskList initialTasks={tasks} />
        )}
      </main>
    </>
  );
}
