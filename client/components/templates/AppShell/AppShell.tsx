'use client';

import { Suspense, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/organisms/Sidebar';
import { BottomNav } from '@/components/organisms/BottomNav';
import type { ShellData } from '@/lib/api';

export interface AppShellProps extends ShellData {
  children: ReactNode;
}

/**
 * The layout template. Navigation is chosen by WIDTH, never by orientation
 * (Module 08 §7.1): sidebar at lg, icon rail at md, bottom bar + FAB below.
 * All three are in the DOM and toggled by breakpoint so there is one component
 * tree, not three implementations. Content is capped at 1120px.
 * Spec: docs/design/01-concept-ia-navigation.md §3, Module 08 §7.3
 */
export function AppShell({ categories, overdueCount, children }: AppShellProps) {
  const router = useRouter();
  const onNewTask = useCallback(() => router.push('/tasks/new'), [router]);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-dvh lg:block">
        <Suspense>
          <Sidebar categories={categories} overdueCount={overdueCount} onNewTask={onNewTask} />
        </Suspense>
      </div>
      {/* Tablet rail */}
      <div className="sticky top-0 hidden h-dvh md:block lg:hidden">
        <Suspense>
          <Sidebar variant="rail" categories={categories} overdueCount={overdueCount} onNewTask={onNewTask} />
        </Suspense>
      </div>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>

      <div className="md:hidden">
        <BottomNav overdueCount={overdueCount} onNewTask={onNewTask} />
      </div>
    </div>
  );
}
