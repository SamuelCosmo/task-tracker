import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** `space-4` inset on both ends, for use between list rows. */
  inset?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

/** 1px `--border`. Semantic <hr>, so it is announced as a separator. */
export function Divider({ inset = false, orientation = 'horizontal', className, ...rest }: DividerProps) {
  return (
    <hr
      aria-orientation={orientation}
      className={cn(
        'shrink-0 border-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px self-stretch',
        inset && (orientation === 'horizontal' ? 'mx-4 w-auto' : 'my-4 h-auto'),
        className,
      )}
      {...rest}
    />
  );
}
