interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-5 pb-8 sm:pb-0">
      <div className="w-full max-w-[400px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <h3 className="text-base font-semibold text-[var(--text)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text)] bg-[var(--surface-2)] active:opacity-80"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:opacity-80"
            style={{ background: "var(--danger)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
