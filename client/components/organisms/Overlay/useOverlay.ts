'use client';

import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLocks = 0;

function lockScroll() {
  if (scrollLocks++ === 0) {
    // Compensate for the vanishing scrollbar so the page does not shift.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
  }
}

function unlockScroll() {
  if (--scrollLocks === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

export interface UseOverlayOptions {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLElement | null>;
  /** Trap Tab inside the panel and lock body scroll. Off for the side panel,
   *  which leaves the page behind it interactive. */
  modal?: boolean;
  /** Push a history entry so system/browser back closes the overlay instead of
   *  leaving the screen (Module 01 §3.8). */
  historyEntry?: boolean;
}

/**
 * The shared contract for Modal, BottomSheet and SidePanel: Esc closes, focus
 * moves in on open and returns to the trigger on close, Tab is trapped while
 * modal, body scroll is locked while modal, and back closes.
 * Spec: docs/design/03-component-system.md §6.4 Modal · BottomSheet · SidePanel
 */
export function useOverlay({ open, onClose, panelRef, modal = true, historyEntry = true }: UseOverlayOptions) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const pushed = useRef(false);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the first focusable thing, or the panel itself.
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    if (modal) lockScroll();

    if (historyEntry) {
      window.history.pushState({ ...window.history.state, __overlay: true }, '');
      pushed.current = true;
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    }
    function onPopState() {
      // The user pressed back: the entry is already gone, just close.
      pushed.current = false;
      onCloseRef.current();
    }
    document.addEventListener('keydown', onKeyDown);
    if (historyEntry) window.addEventListener('popstate', onPopState);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (historyEntry) window.removeEventListener('popstate', onPopState);
      if (modal) unlockScroll();
      // Closed by Esc / ✕ / scrim rather than back: retire our history entry.
      if (pushed.current) {
        pushed.current = false;
        window.history.back();
      }
      // Restore focus unless the user has already moved on.
      if (!document.activeElement || document.activeElement === document.body || panel?.contains(document.activeElement)) {
        previouslyFocused?.focus?.();
      }
    };
  }, [open, panelRef, modal, historyEntry]);

  /** Attach to the panel's onKeyDown to keep Tab inside it. */
  function trapTab(event: KeyboardEvent<HTMLElement>) {
    if (!modal || event.key !== 'Tab' || !panelRef.current) return;
    const focusables = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return { trapTab };
}
