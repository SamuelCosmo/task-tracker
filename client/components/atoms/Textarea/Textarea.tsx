'use client';

import { useLayoutEffect, useRef, type ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { inputClassName } from '@/components/atoms/Input';

export interface TextareaProps extends ComponentProps<'textarea'> {
  invalid?: boolean;
  /** Grows with content up to this height, then scrolls internally. */
  maxHeight?: number;
}

const MIN_HEIGHT = 96; // 4 rows at text-body
const MAX_HEIGHT = 240;

/**
 * Input geometry, auto-growing. The manual resize handle is disabled: it breaks
 * the layout grid and is redundant with auto-grow.
 * Spec: docs/design/03-component-system.md §6.2 Textarea
 */
export function Textarea({
  invalid = false,
  maxHeight = MAX_HEIGHT,
  className,
  value,
  onInput,
  ref,
  ...rest
}: TextareaProps) {
  const innerRef = useRef<HTMLTextAreaElement>(null);

  function setRefs(node: HTMLTextAreaElement | null) {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }

  function fit(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    const next = Math.max(MIN_HEIGHT, Math.min(el.scrollHeight, maxHeight));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  // Controlled: refit whenever the value changes from outside (e.g. a reset).
  useLayoutEffect(() => {
    if (innerRef.current) fit(innerRef.current);
  });

  function handleInput(event: Parameters<NonNullable<TextareaProps['onInput']>>[0]) {
    fit(event.currentTarget);
    onInput?.(event);
  }

  return (
    <textarea
      ref={setRefs}
      value={value}
      onInput={handleInput}
      aria-invalid={invalid || undefined}
      rows={4}
      className={cn(inputClassName, 'resize-none px-3 py-2.5 text-body leading-5', className)}
      style={{ minHeight: MIN_HEIGHT, maxHeight }}
      {...rest}
    />
  );
}
