'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon, Kbd } from '@/components/atoms';
import { Popover } from '@/components/molecules/Popover';

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  /** Rendered in the final group, in the error tier. */
  destructive?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

export interface MenuProps {
  /** Groups are separated by dividers. Put destructive items in the last group. */
  groups: MenuItem[][];
  /** Receives the trigger's ref and open state; render an IconButton or Button. */
  trigger: (props: {
    ref: RefObject<HTMLButtonElement | null>;
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
    'aria-controls': string | undefined;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  }) => ReactNode;
  align?: 'start' | 'end';
}

/**
 * Overflow / action menu. Click to open (never hover — unusable on touch and
 * opens accidentally in transit). ↑↓ move, Enter selects, typing jumps, Esc
 * closes and returns focus. Spec: Module 03 §6.3 Select / Menu
 */
export function Menu({ groups, trigger, align = 'end' }: MenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const flat = groups.flatMap((group, g) => group.map((item, i) => ({ item, g, i })));
  const enabled = flat.map((f, idx) => (f.item.disabled ? -1 : idx)).filter((i) => i >= 0);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) menuRef.current?.focus();
  }, [open]);

  function openMenu(startAt = enabled[0] ?? -1) {
    setActiveIndex(startAt);
    setOpen(true);
  }

  function commit(index: number) {
    const entry = flat[index];
    if (!entry || entry.item.disabled) return;
    close();
    entry.item.onSelect();
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(enabled[enabled.length - 1]);
    }
  }

  function step(delta: number) {
    setActiveIndex((current) => {
      const pos = enabled.indexOf(current);
      return enabled[(pos + delta + enabled.length) % enabled.length] ?? current;
    });
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        step(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        step(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(enabled[0]);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(enabled[enabled.length - 1]);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Tab':
        close();
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const match = flat.findIndex(
            (f) => !f.item.disabled && f.item.label.toLowerCase().startsWith(event.key.toLowerCase()),
          );
          if (match >= 0) setActiveIndex(match);
        }
    }
  }

  // Flat index of the first item in each group, so items can be numbered
  // without mutating anything during render.
  const offsets = groups.reduce<number[]>((acc, group, g) => {
    acc.push(g === 0 ? 0 : acc[g - 1] + groups[g - 1].length);
    return acc;
  }, []);

  return (
    <>
      {trigger({
        ref: triggerRef,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
        onClick: () => (open ? close() : openMenu()),
        onKeyDown: onTriggerKeyDown,
      })}

      <Popover open={open} onClose={close} anchorRef={triggerRef} align={align} initialFocus="none">
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-activedescendant={activeIndex >= 0 ? `${menuId}-${activeIndex}` : undefined}
          onKeyDown={onMenuKeyDown}
          className="min-w-44 outline-none"
        >
          {groups.map((group, g) => (
            <div key={g} role="group">
              {g > 0 && <div role="separator" className="my-1 h-px bg-border" />}
              {group.map((item, i) => {
                const index = offsets[g] + i;
                const isActive = index === activeIndex;
                return (
                  <div
                    key={item.label}
                    id={`${menuId}-${index}`}
                    role="menuitem"
                    aria-disabled={item.disabled || undefined}
                    onPointerMove={() => !item.disabled && setActiveIndex(index)}
                    onClick={() => commit(index)}
                    className={cn(
                      'flex h-9 cursor-default items-center gap-2 rounded-md px-3 text-body select-none',
                      item.destructive ? 'text-error-strong' : 'text-text-primary',
                      isActive && (item.destructive ? 'bg-error-light' : 'bg-surface-secondary'),
                      item.disabled && 'cursor-not-allowed text-text-disabled',
                    )}
                  >
                    {item.icon && <Icon icon={item.icon} size="sm" />}
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && <Kbd className="pointer-coarse:hidden">{item.shortcut}</Kbd>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Popover>
    </>
  );
}
