'use client';

import { useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/atoms';
import { useOverlay } from '@/components/organisms/Overlay/useOverlay';

export interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name. The panel has no visible title: the content's own
   *  heading (e.g. the task title) is the first thing in the body. */
  label: string;
  /** Header actions rendered right of the close button (Edit, overflow…). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * 400px panel docked to the right on desktop, NO scrim: the list behind stays
 * interactive — that is the whole reason for a panel over a modal. Clicking
 * another row swaps the content; only Esc and ✕ close it.
 * Below lg the same content is a full-screen route (Module 08 §7.4).
 * Rendered in place (not a portal) so it lives in the page's grid.
 * Spec: docs/design/03-component-system.md §6.4 SidePanel
 */
export function SidePanel({ open, onClose, label, actions, children, className }: SidePanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  useOverlay({ open, onClose, panelRef, modal: false });

  if (!open) return null;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      className={cn(
        'z-(--z-panel) flex h-full w-[400px] shrink-0 flex-col border-l border-border bg-surface shadow-modal outline-none',
        'transition-transform duration-(--duration-slow) ease-standard starting:translate-x-full',
        className,
      )}
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
        <IconButton icon={X} label="Close panel" onClick={onClose} />
        <div className="flex items-center gap-1">{actions}</div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}
