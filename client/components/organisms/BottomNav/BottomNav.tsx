'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms';
import { NavItem } from '@/components/molecules';
import { NAV, isActivePath } from '@/lib/navigation';

export interface BottomNavProps {
  overdueCount: number;
  onNewTask: () => void;
  /** Suppress the FAB, e.g. on the create/edit screens where it is redundant. */
  hideFab?: boolean;
}

/**
 * Mobile navigation: 4 items, 56px + safe area, OPAQUE surface (a translucent
 * bar over a scrolling list makes both harder to read). Create is a FAB, not
 * a fifth item — it is an action, not a destination. The FAB hides on scroll
 * down and returns on scroll up.
 * Spec: docs/design/01-concept-ia-navigation.md §3.4, Module 03 §6.4
 */
export function BottomNav({ overdueCount, onNewTask, hideFab = false }: BottomNavProps) {
  const pathname = usePathname();
  const [fabVisible, setFabVisible] = useState(true);

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // Small dead zone so a wobble does not toggle it.
        if (y > last + 8) setFabVisible(false);
        else if (y < last - 8 || y < 16) setFabVisible(true);
        last = y;
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {!hideFab && (
        <button
          type="button"
          onClick={onNewTask}
          aria-label="New task"
          className={cn(
            'fixed right-4 bottom-[calc(56px+16px+env(safe-area-inset-bottom))] z-(--z-fab) flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-raised',
            'transition-[transform,opacity,box-shadow] duration-(--duration-base) ease-standard hover:bg-primary-hover active:scale-95 active:shadow-overlay',
            !fabVisible && 'pointer-events-none translate-y-24 opacity-0',
          )}
        >
          <Icon icon={Plus} size="lg" />
        </button>
      )}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-(--z-nav) flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            variant="bottom"
            active={isActivePath(pathname, item.href)}
            badge={item.href === '/tasks' && overdueCount > 0 ? overdueCount : undefined}
            badgeTone="error"
          />
        ))}
      </nav>
    </>
  );
}
