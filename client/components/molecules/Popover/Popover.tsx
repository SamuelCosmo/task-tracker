'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  open: boolean;
  onClose: () => void;
  /** The element the popover is positioned against and that focus returns to. */
  anchorRef: RefObject<HTMLElement | null>;
  align?: 'start' | 'end';
  /** Min-width follows the anchor (Select); otherwise content-sized. */
  matchWidth?: boolean;
  /** Where to put focus on open. `none` for pickers that manage their own. */
  initialFocus?: 'first' | 'container' | 'none';
  children: ReactNode;
}

const GAP = 4;
const VIEWPORT_INSET = 8;

/**
 * Anchored overlay: positions below the anchor (flips above when there is no
 * room), closes on Esc / outside pointer-down, restores focus to the anchor.
 * Rendered in a portal at z-dropdown. Scale-in from the anchor (150ms) so the
 * motion has an origin. Spec: docs/design/03-component-system.md §6.3 Select
 */
export function Popover({
  open,
  onClose,
  anchorRef,
  align = 'start',
  matchWidth = false,
  initialFocus = 'first',
  className,
  children,
  ...rest
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Position against the anchor; re-run on scroll and resize while open.
  // Written straight to the DOM: no state, no re-render per scroll tick.
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    function place() {
      if (!anchor || !panel) return;
      const a = anchor.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      const spaceBelow = window.innerHeight - a.bottom - VIEWPORT_INSET;
      const flip = p.height > spaceBelow && a.top > p.height + VIEWPORT_INSET;
      const top = flip ? a.top - p.height - GAP : a.bottom + GAP;
      let left = align === 'start' ? a.left : a.right - p.width;
      left = Math.max(VIEWPORT_INSET, Math.min(left, window.innerWidth - p.width - VIEWPORT_INSET));
      const maxHeight = Math.max(160, (flip ? a.top : window.innerHeight - a.bottom) - GAP - VIEWPORT_INSET);
      Object.assign(panel.style, {
        top: `${top}px`,
        left: `${left}px`,
        minWidth: matchWidth ? `${a.width}px` : '',
        maxHeight: `${maxHeight}px`,
        transformOrigin: flip ? 'bottom' : 'top',
        visibility: 'visible',
      });
    }

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchorRef, align, matchWidth]);

  // Dismissal + focus management.
  useEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const panel = panelRef.current;

    if (initialFocus === 'first') {
      panel?.querySelector<HTMLElement>('[tabindex="0"], button:not([disabled]), [href]')?.focus();
    } else if (initialFocus === 'container') {
      panel?.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panel?.contains(target) || anchor?.contains(target)) return;
      onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      // Return focus to the trigger unless the user has already moved on.
      if (document.activeElement === document.body || panel?.contains(document.activeElement)) {
        anchor?.focus();
      }
    };
  }, [open, onClose, anchorRef, initialFocus]);

  // Popovers open on interaction, so the server never renders one; the guard
  // keeps createPortal off the server path without a mounted-state effect.
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={panelRef}
      tabIndex={-1}
      className={cn(
        'invisible fixed z-(--z-dropdown) overflow-auto rounded-lg border border-border bg-surface-overlay p-1 shadow-overlay outline-none',
        'transition-[opacity,transform] duration-(--duration-fast) ease-standard',
        'starting:scale-95 starting:opacity-0',
        // `invisible` until place() runs, so the first paint is never at 0,0.
        className,
      )}
      {...rest}
    >
      {children}
    </div>,
    document.body,
  );
}
