import { useEffect } from "react";
import { CheckIcon, CloseIcon } from "./Icons";

export interface ToastState {
  kind: "success" | "error";
  message: string;
}

export function Toast({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  const isSuccess = toast.kind === "success";

  return (
    <div className="absolute left-0 right-0 top-3 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          isSuccess
            ? "bg-[var(--surface-2)] border-[var(--income)]/40 text-[var(--text)]"
            : "bg-[var(--surface-2)] border-[var(--expense)]/40 text-[var(--text)]"
        }`}
      >
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            isSuccess ? "bg-[var(--income)]/20 text-[var(--income)]" : "bg-[var(--expense)]/20 text-[var(--expense)]"
          }`}
        >
          {isSuccess ? <CheckIcon className="w-3 h-3" /> : <CloseIcon className="w-3 h-3" />}
        </span>
        {toast.message}
      </div>
    </div>
  );
}
