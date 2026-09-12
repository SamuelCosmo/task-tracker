'use client';

import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/atoms';
import { useOverlay } from '@/components/organisms/Overlay/useOverlay';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 560px for forms; `sm` is 440px for small confirmations. */
  size?: 'md' | 'sm';
  /** Sticky footer, usually Cancel + primary action. */
  footer?: ReactNode;
  /** Header count/annotation, e.g. "2 added" for save-and-add-another. */
  subtitle?: string;
  children: ReactNode;
}

/**
 * Centred dialog for tablet and desktop. Below md the same content should be a
 * full-screen route instead (Module 08 §7.4) — a modal over a keyboard-shrunk
 * viewport leaves a third of the screen usable.
 * Header and footer stay put while the body scrolls. Fade + scale 0.96→1, 280ms.
 * Spec: docs/design/03-component-system.md §6.4 Modal
 */
export function Modal({ open, onClose, title, size = 'md', footer, subtitle, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { trapTab } = useOverlay({ open, onClose, panelRef });

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-(--z-backdrop) flex items-center justify-center p-4">
      {/* Scrim */}
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-scrim transition-opacity duration-(--duration-slow) starting:opacity-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={trapTab}
        className={cn(
          'relative z-(--z-modal) flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-surface-modal shadow-modal outline-none',
          'dark:border dark:border-border',
          'transition-[opacity,transform] duration-(--duration-slow) ease-standard starting:scale-[0.96] starting:opacity-0',
          size === 'md' ? 'max-w-[560px]' : 'max-w-[440px]',
        )}
      >
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border pr-3 pl-6">
          <h2 id={titleId} className="flex-1 truncate text-h2 text-text-primary">
            {title}
            {subtitle && <span className="ml-2 text-sm font-normal text-text-muted">· {subtitle}</span>}
          </h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        {footer && (
          <footer className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-border px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
