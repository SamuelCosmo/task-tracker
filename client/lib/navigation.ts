import { CalendarDays, Home, ListChecks, Tag, type LucideIcon } from 'lucide-react';

export interface NavDestination {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Keyboard "go to" key after G (Module 01 §3.7). */
  key: string;
}

/** The four primary destinations. Exactly four: fits a bottom bar with a FAB
 *  and maps 1:1 to the sidebar (Module 01 §3.1). */
export const NAV: NavDestination[] = [
  { href: '/', label: 'Home', icon: Home, key: 'h' },
  { href: '/tasks', label: 'Tasks', icon: ListChecks, key: 't' },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays, key: 'c' },
  { href: '/categories', label: 'Categories', icon: Tag, key: 'y' },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
