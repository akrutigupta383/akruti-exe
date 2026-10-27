import { useId, useRef } from 'react';
import { Dialog } from './Dialog';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

interface ConfirmDialogProps {
  request: ConfirmRequest;
  onDismiss: () => void;
}

export function ConfirmDialog({ request, onDismiss }: ConfirmDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      labelledBy={titleId}
      onClose={onDismiss}
      initialFocusRef={cancelRef}
      zIndexClass="z-[60]"
      className="w-full max-w-md p-6 sm:p-7"
    >
      <h2 id={titleId} className="font-display text-2xl font-bold text-white">
        {request.title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-white/75">{request.message}</p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button ref={cancelRef} type="button" className="btn btn-ghost" onClick={onDismiss}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            request.onConfirm();
            onDismiss();
          }}
        >
          {request.confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
