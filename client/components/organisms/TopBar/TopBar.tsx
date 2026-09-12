'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/atoms';

export interface TopBarProps {
  /** Mobile: contextual screen title. Desktop screens render their own h1. */
  title?: string;
  /** Mobile: shows a back button instead of nothing on the left. */
  back?: boolean;
  /** Right-side controls — search icon, overflow, or the desktop search bar. */
  actions?: ReactNode;
  /** Desktop-only content on the left (e.g. the greeting). */
  children?: ReactNode;
}

/**
 * Sticky, 56px mobile / 64px desktop, canvas-coloured. The bottom border
 * appears only once the content has scrolled — a permanent line under an
 * unscrolled header is noise.
 * Spec: docs/design/03-component-system.md §6.4 TopBar
 */
export function TopBar({ title, back = false, actions, children }: TopBarProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-(--z-sticky) flex h-14 shrink-0 items-center gap-2 bg-background px-4 md:h-16 md:px-6 lg:px-8',
        'border-b transition-colors duration-(--duration-instant)',
        scrolled ? 'border-border' : 'border-transparent',
      )}
    >
      {back && (
        <IconButton icon={ArrowLeft} label="Back" onClick={() => router.back()} className="-ml-2 md:hidden" />
      )}
      {title && <h1 className="flex-1 truncate text-h2 text-text-primary md:hidden">{title}</h1>}
      <div className="hidden min-w-0 flex-1 items-center md:flex">{children}</div>
      {!title && <span className="flex-1 md:hidden" />}
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  );
}
