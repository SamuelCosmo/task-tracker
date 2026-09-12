'use client';

import { useId, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { useOverlay } from '@/components/organisms/Overlay/useOverlay';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name; rendered as a header when `showTitle`. */
  title: string;
  showTitle?: boolean;
  children: ReactNode;
}

const DISMISS_DISTANCE = 80;

/**
 * The mobile counterpart of a popover or small modal (filters, pickers,
 * selects): anchored near the thumb, radius-xl on the top corners only, slides
 * up in 320ms. Dismiss by Esc, scrim, or dragging the handle down.
 * Spec: docs/design/03-component-system.md §6.4 BottomSheet
 */
export function BottomSheet({ open, onClose, title, showTitle = false, children }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { trapTab } = useOverlay({ open, onClose, panelRef });
  const drag = useRef<{ startY: number; pointerId: number } | null>(null);
  // The distance lives in a ref as well as state: a fast move→release can fire
  // before the state from the last move has flushed, and the release must not
  // decide on a stale value.
  const distance = useRef(0);
  const [offset, setOffset] = useState(0);

  function onHandleDown(event: PointerEvent<HTMLDivElement>) {
    drag.current = { startY: event.clientY, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onHandleMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    distance.current = Math.max(0, event.clientY - drag.current.startY);
    setOffset(distance.current);
  }
  function onHandleUp() {
    if (!drag.current) return;
    const dismiss = distance.current > DISMISS_DISTANCE;
    drag.current = null;
    distance.current = 0;
    setOffset(0);
    if (dismiss) onClose();
  }

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-(--z-backdrop) flex items-end justify-center">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-scrim transition-opacity duration-(--duration-sheet) starting:opacity-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={showTitle ? undefined : title}
        aria-labelledby={showTitle ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={trapTab}
        style={{ transform: offset ? `translateY(${offset}px)` : undefined }}
        className={cn(
          'relative z-(--z-modal) flex max-h-[92vh] w-full flex-col rounded-t-xl bg-surface-modal pb-[env(safe-area-inset-bottom)] shadow-modal outline-none',
          'dark:border-t dark:border-border',
          !offset && 'transition-transform duration-(--duration-sheet) ease-sheet starting:translate-y-full',
        )}
      >
        {/* Drag handle — the whole strip is the target, not just the pill. */}
        <div
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
          aria-hidden
        >
          <span className="h-1 w-9 rounded-full bg-border-strong" />
        </div>
        {showTitle && (
          <h2 id={titleId} className="shrink-0 px-4 pb-3 text-h3 text-text-primary">
            {title}
          </h2>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
