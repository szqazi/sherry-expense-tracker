import { useState } from "react";
import type { Entry } from "../lib/types";
import { CURRENCY_SYMBOL } from "../lib/currency";

interface DemoCleanupModalProps {
  candidates: Entry[];
  onDelete: (ids: string[]) => void;
  onCancel: () => void;
}

export function DemoCleanupModal({ candidates, onDelete, onCancel }: DemoCleanupModalProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(candidates.map((e) => e.id)));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-5 pb-8 sm:pb-0">
      <div className="w-full max-w-[420px] max-h-[85vh] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col">
        <h3 className="text-base font-semibold text-[var(--text)] mb-1">Possible demo entries found</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          These {candidates.length} entries match the sample demo data and were likely mixed into your real data.
          Review and deselect any that are actually yours, then delete the rest.
        </p>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4 -mx-1 px-1">
          {candidates.map((entry) => (
            <label
              key={entry.id}
              className="flex items-center gap-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5"
            >
              <input
                type="checkbox"
                checked={selected.has(entry.id)}
                onChange={() => toggle(entry.id)}
                className="w-4 h-4 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--text)] truncate">{entry.category}</span>
                  <span
                    className="text-sm font-semibold shrink-0"
                    style={{ color: entry.type === "income" ? "var(--income)" : "var(--expense)" }}
                  >
                    {entry.type === "income" ? "+" : "-"}
                    {CURRENCY_SYMBOL[entry.currency]}
                    {entry.amount.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] truncate">
                  {entry.date}
                  {entry.comment ? ` · ${entry.comment}` : ""}
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text)] bg-[var(--surface-2)] active:opacity-80"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete([...selected])}
            disabled={selected.size === 0}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:opacity-80 disabled:opacity-40"
            style={{ background: "var(--danger)" }}
          >
            Delete {selected.size} Selected
          </button>
        </div>
      </div>
    </div>
  );
}
