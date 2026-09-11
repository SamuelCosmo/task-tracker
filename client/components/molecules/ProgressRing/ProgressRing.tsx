import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms';

export interface ProgressRingProps {
  /** 0–100. */
  value: number;
  label: string;
  size?: number;
  className?: string;
}

const STROKE = 6;

/**
 * 64px ring, 6px stroke, sweep starts at 12 o'clock and animates 280ms.
 * At 100% it turns green with a check — the one persistent state that earns
 * the colour. Spec: Module 03 §6.3 ProgressRing, Module 04 §5.1.3
 */
export function ProgressRing({ value, label, size = 64, className }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const complete = clamped >= 100;
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-surface-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-[stroke-dashoffset,stroke] duration-(--duration-slow) ease-standard',
            complete ? 'stroke-success' : 'stroke-primary',
          )}
        />
      </svg>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 flex items-center justify-center text-h3 tabular-nums',
          complete ? 'text-success-strong' : 'text-text-primary',
        )}
      >
        {complete ? <Icon icon={Check} size="lg" /> : `${Math.round(clamped)}%`}
      </span>
    </div>
  );
}
