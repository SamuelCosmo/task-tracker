'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms';

export type ToastVariant = 'neutral' | 'success' | 'error';

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  /** Inline action, e.g. Undo or Retry. */
  action?: { label: string; onClick: () => void };
  /** ms. Defaults: 5000; 8000 with an action or for errors. */
  duration?: number;
  /**
   * Called when the toast leaves WITHOUT its action having been taken. This is
   * where a deferred delete actually sends its request — which is what makes
   * undo instant and free (Module 05 §5.7.5).
   */
  onExpire?: () => void;
}

interface ToastRecord extends ToastOptions {
  id: number;
  actionTaken: boolean;
  timer: ReturnType<typeof setTimeout>;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}

const MAX_VISIBLE = 3;
let nextId = 1;

/**
 * Bottom-centre on mobile, bottom-left on desktop, above the bottom nav.
 * Inverted surface. Max 3 stacked, oldest dismissed first. Polite live region;
 * errors are assertive.
 *
 * Records live in a ref and React state only mirrors them for rendering, so
 * side effects (onExpire, timers) never run inside a state updater — which
 * StrictMode would invoke twice.
 * Spec: docs/design/03-component-system.md §6.3 Toast
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const records = useRef(new Map<number, ToastRecord>());
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const sync = useCallback(() => setToasts([...records.current.values()]), []);

  const remove = useCallback(
    (id: number, viaAction: boolean) => {
      const record = records.current.get(id);
      if (!record) return;
      clearTimeout(record.timer);
      records.current.delete(id);
      if (!viaAction && !record.actionTaken) record.onExpire?.();
      sync();
    },
    [sync],
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId++;
      const duration = options.duration ?? (options.action || options.variant === 'error' ? 8000 : 5000);
      records.current.set(id, {
        ...options,
        id,
        actionTaken: false,
        timer: setTimeout(() => remove(id, false), duration),
      });
      // Oldest out first when the stack overflows; it leaves un-actioned.
      while (records.current.size > MAX_VISIBLE) {
        const oldest = records.current.keys().next().value;
        if (oldest === undefined) break;
        remove(oldest, false);
      }
      sync();
      return id;
    },
    [remove, sync],
  );

  const dismiss = useCallback((id: number) => remove(id, false), [remove]);

  function takeAction(id: number) {
    const record = records.current.get(id);
    if (!record) return;
    record.actionTaken = true;
    record.action?.onClick();
    remove(id, true);
  }

  useEffect(() => {
    const map = records.current;
    return () => map.forEach((record) => clearTimeout(record.timer));
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-[calc(56px+16px+env(safe-area-inset-bottom))] z-(--z-toast) flex flex-col items-center gap-2 md:inset-x-auto md:bottom-4 md:left-4 md:items-start">
        {toasts.map((record) => (
          <div
            key={record.id}
            role={record.variant === 'error' ? 'alert' : 'status'}
            aria-live={record.variant === 'error' ? 'assertive' : 'polite'}
            className={cn(
              'pointer-events-auto flex min-h-12 w-full max-w-md items-center gap-3 rounded-lg bg-text-primary py-3 pr-2 pl-4 text-body text-surface shadow-modal',
              'transition-[opacity,transform] duration-(--duration-base) ease-standard starting:translate-y-2 starting:opacity-0',
            )}
          >
            {record.variant === 'success' && (
              <Icon icon={CheckCircle2} size="md" className="shrink-0 text-success" />
            )}
            {record.variant === 'error' && (
              <Icon icon={AlertCircle} size="md" className="shrink-0 text-error" />
            )}
            <span className="flex-1 leading-5">{record.message}</span>
            {record.action && (
              <button
                type="button"
                onClick={() => takeAction(record.id)}
                className="shrink-0 rounded-md px-2 py-1 text-body-strong text-primary-inverse underline-offset-4 hover:underline"
              >
                {record.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(record.id, false)}
              aria-label="Dismiss"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-surface/70 hover:bg-surface/10 hover:text-surface"
            >
              <Icon icon={X} size="sm" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
