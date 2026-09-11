import type { PaletteColor } from '@/components/atoms/Dot';

/* Mirrors the API contract in server/app.js. Framework-neutral. */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export const TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export interface Category {
  id: number;
  name: string;
  color: PaletteColor;
  icon: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  /** YYYY-MM-DD or null. */
  dueDate: string | null;
  categoryId: number | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  /** Derived server-side from status. */
  done: boolean;
  /** Derived server-side from dueDate + status. */
  overdue: boolean;
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};
