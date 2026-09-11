/* Date-only helpers. Every function works on YYYY-MM-DD strings and local
   calendar days, never on Date instants — the same rule that fixed the
   "due today reads as overdue west of UTC" bug on the server. */

const DAY_MS = 86_400_000;

/** Today's LOCAL calendar date as YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** Parse YYYY-MM-DD as a local-midnight Date (not UTC), so weekday math is local. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). Negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / DAY_MS);
}

export function isOverdue(dueDate: string | null, done: boolean, today = todayISO()): boolean {
  return !done && dueDate !== null && dueDate < today;
}

/** Due within the next 2 days (inclusive of today), not overdue, not done. */
export function isDueSoon(dueDate: string | null, done: boolean, today = todayISO()): boolean {
  if (done || dueDate === null) return false;
  const delta = daysBetween(today, dueDate);
  return delta >= 0 && delta <= 2;
}

/**
 * Relative label per Module 03 §6.3 TaskMeta:
 * Today · Tomorrow · Yesterday · weekday name within 7 days · "Sep 24" ·
 * "Sep 24, 2027" once the year differs. Past dates beyond yesterday read
 * "3 days ago" so overdue work is unambiguous.
 */
export function formatRelativeDate(
  iso: string,
  today = todayISO(),
  locale?: string,
): string {
  const delta = daysBetween(today, iso);
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta === -1) return 'Yesterday';
  if (delta < -1 && delta >= -6) return `${-delta} days ago`;
  const date = parseISODate(iso);
  if (delta > 1 && delta <= 6) return date.toLocaleDateString(locale, { weekday: 'long' });
  const sameYear = iso.slice(0, 4) === today.slice(0, 4);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** "Sep 8, 2026" — always absolute, for detail views and tooltips. */
export function formatAbsoluteDate(iso: string, locale?: string): string {
  return parseISODate(iso).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "2 days ago" / "in 3 days" / "today" — for pairing with an absolute date. */
export function formatRelativeAge(iso: string, today = todayISO()): string {
  const delta = daysBetween(today, iso);
  if (delta === 0) return 'today';
  if (delta === 1) return 'tomorrow';
  if (delta === -1) return 'yesterday';
  return delta < 0 ? `${-delta} days ago` : `in ${delta} days`;
}
