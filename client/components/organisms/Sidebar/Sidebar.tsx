'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Dot, IconButton } from '@/components/atoms';
import { NavItem } from '@/components/molecules';
import ThemeToggle from '@/app/ThemeToggle';
import { NAV, isActivePath } from '@/lib/navigation';
import type { Category } from '@/lib/tasks';

export interface SidebarProps {
  /** Categories with live open-task counts, for the saved-filter list. */
  categories: (Category & { openCount: number })[];
  overdueCount: number;
  /** `rail` is the 72px icon-only form for 768–1023px. */
  variant?: 'sidebar' | 'rail';
  onNewTask: () => void;
}

/**
 * Desktop sidebar (240px) and tablet rail (72px). "New task" sits ABOVE the
 * nav: it is the most frequent action, so it gets the most stable hit target
 * on the screen. Categories are saved filters into /tasks?category=N — the
 * most common filter earns permanent real estate. Theme + Settings pin to the
 * footer; the middle scrolls if categories overflow.
 * Spec: docs/design/01-concept-ia-navigation.md §3.2–3.3, Module 03 §6.4
 */
export function Sidebar({ categories, overdueCount, variant = 'sidebar', onNewTask }: SidebarProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCategory = pathname === '/tasks' ? params.get('category') : null;
  const rail = variant === 'rail';

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-border bg-surface dark:bg-background',
        rail ? 'w-18 items-center px-3 py-3' : 'w-60 px-4 py-4',
      )}
    >
      {/* Logo row */}
      <Link
        href="/"
        className={cn('flex h-10 items-center gap-2 rounded-md', rail ? 'justify-center' : 'px-2')}
        aria-label="Momentum home"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-on-primary text-caption font-semibold">
          M
        </span>
        {!rail && <span className="text-body-strong text-text-primary">Momentum</span>}
      </Link>

      <div className={cn('mt-4', rail && 'flex justify-center')}>
        {rail ? (
          <IconButton icon={Plus} label="New task" variant="primary" size="md" onClick={onNewTask} />
        ) : (
          <Button iconLeft={Plus} fullWidth onClick={onNewTask}>
            New task
          </Button>
        )}
      </div>

      <div className={cn('mt-4 flex flex-col', rail ? 'items-center gap-1.5' : 'gap-0.5 pl-2')}>
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            variant={variant}
            active={isActivePath(pathname, item.href)}
            badge={item.href === '/tasks' && overdueCount > 0 ? overdueCount : undefined}
            badgeTone="error"
          />
        ))}
      </div>

      {/* Categories: dropped from the rail — icon-only coloured dots are unidentifiable. */}
      {!rail && categories.length > 0 && (
        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-3">
            <span className="text-overline uppercase text-text-muted">Categories</span>
          </div>
          <ul className="mt-2 flex flex-col gap-0.5 overflow-y-auto pl-2">
            {categories.map((category) => {
              const active = activeCategory === String(category.id);
              return (
                <li key={category.id}>
                  <Link
                    href={`/tasks?category=${category.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-3 rounded-md px-3 text-body transition-colors duration-(--duration-instant)',
                      active
                        ? 'bg-primary-light text-primary-strong'
                        : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
                    )}
                  >
                    <Dot color={category.color} />
                    <span className="flex-1 truncate">{category.name}</span>
                    <span className="text-caption tabular-nums text-text-muted">{category.openCount}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className={cn('mt-auto flex pt-4', rail ? 'flex-col items-center gap-1.5' : 'items-center justify-between pl-2')}>
        <ThemeToggle />
        <NavItem href="/settings" icon={Settings} label="Settings" variant="rail" active={isActivePath(pathname, '/settings')} />
      </div>
    </nav>
  );
}
