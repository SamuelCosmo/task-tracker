import 'server-only';
import { isOverdue } from '@/lib/dates';
import type { Category, Task } from '@/lib/tasks';

/* Server-side data access. Runs in Server Components only — the browser talks
   to NEXT_PUBLIC_API_URL through client components instead. */

const API_URL = process.env.API_URL;

async function get<T>(path: string): Promise<T> {
  if (!API_URL) throw new Error('API_URL is not set');
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  return res.json();
}

export function getTasks() {
  return get<Task[]>('/tasks');
}

export function getCategories() {
  return get<Category[]>('/categories');
}

export interface ShellData {
  categories: (Category & { openCount: number })[];
  overdueCount: number;
}

/**
 * Everything the app shell needs. Degrades to empty rather than throwing: the
 * chrome must render even when the API is down, so the page can show its own
 * inline error with navigation still available (Module 07 §7.6).
 */
export async function getShellData(): Promise<ShellData> {
  try {
    const [tasks, categories] = await Promise.all([getTasks(), getCategories()]);
    const open = tasks.filter((t) => !t.done);
    return {
      categories: categories.map((c) => ({
        ...c,
        openCount: open.filter((t) => t.categoryId === c.id).length,
      })),
      // Derived here, not read from the API: the API computes `overdue` in ITS
      // zone (UTC in Docker), and a task due today would count as overdue after
      // 5pm Denver time. The client's own date helpers are the authority.
      overdueCount: tasks.filter((t) => isOverdue(t.dueDate, t.done)).length,
    };
  } catch {
    return { categories: [], overdueCount: 0 };
  }
}
