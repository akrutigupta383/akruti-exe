import { type KeyboardEvent, type ReactNode, type RefObject, useEffect, useRef } from 'react';

interface DialogProps {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  /** Element to focus on open; defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement>;
  variant?: 'center' | 'sheet';
  className?: string;
  /** Close when the dimmed backdrop is clicked. */
  closeOnBackdrop?: boolean;
  zIndexClass?: string;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal shell: traps focus, closes on Escape, restores focus on
 * close. Escape is handled on the panel itself, so a dialog stacked on top of
 * another only closes itself.
 */
export function Dialog({
  labelledBy,
  onClose,
  children,
  initialFocusRef,
  variant = 'center',
  className = '',
  closeOnBackdrop = true,
  zIndexClass = 'z-40',
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target =
      initialFocusRef?.current ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
    target?.focus({ preventScroll: true });
    return () => previouslyFocused?.focus?.({ preventScroll: true });
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={`dialog-backdrop fixed inset-0 flex ${zIndexClass} ${
        variant === 'sheet' ? 'justify-end' : 'items-center justify-center p-4'
      }`}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={`${variant === 'sheet' ? 'dialog-sheet' : 'dialog-panel'} outline-none ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
