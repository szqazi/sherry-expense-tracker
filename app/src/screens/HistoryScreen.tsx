import { useMemo } from "react";
import { useApp } from "../lib/AppContext";
import { formatAmount } from "../lib/currency";
import { EditIcon } from "../components/Icons";
import type { Entry } from "../lib/types";

interface HistoryScreenProps {
  onEdit: (entry: Entry) => void;
}

function formatEntryDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function groupLabel(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function HistoryScreen({ onEdit }: HistoryScreenProps) {
  const { entries } = useApp();

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [entries],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of sorted) {
      const label = groupLabel(e.date);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(e);
    }
    return [...map.entries()];
  }, [sorted]);

  return (
    <div className="flex-1 flex flex-col px-5 pb-6">
      {entries.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] mt-16 text-center">No entries yet.</p>
      ) : (
        <div className="flex flex-col gap-5 mt-1">
          {groups.map(([label, groupEntries]) => (
            <div key={label}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2">
                {label}
              </h3>
              <div className="flex flex-col gap-2">
                {groupEntries.map((entry) => (
                  <HistoryRow key={entry.id} entry={entry} onEdit={() => onEdit(entry)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ entry, onEdit }: { entry: Entry; onEdit: () => void }) {
  const color = entry.type === "expense" ? "var(--expense)" : "var(--income)";
  return (
    <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5">
      <div className="min-w-0">
        <div className="text-sm text-[var(--text)] truncate">
          <span className="text-[var(--text-muted)]">{formatEntryDate(entry.date)}: </span>
          <span className="font-semibold" style={{ color }}>
            {formatAmount(entry.amount, entry.currency)}
          </span>
          <span className="text-[var(--text-muted)]"> : {entry.category}</span>
        </div>
        {entry.comment && (
          <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{entry.comment}</div>
        )}
      </div>
      <button
        onClick={onEdit}
        className="w-8 h-8 shrink-0 ml-2 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
        aria-label="Edit entry"
      >
        <EditIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
