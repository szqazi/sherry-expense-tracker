import { useMemo, useState } from "react";
import { useApp } from "../lib/AppContext";
import { formatAmount } from "../lib/currency";
import { EditIcon, FilterIcon } from "../components/Icons";
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

interface Filters {
  dateFrom: string;
  dateTo: string;
  category: string;
  comment: string;
}

const EMPTY_FILTERS: Filters = { dateFrom: "", dateTo: "", category: "", comment: "" };

export function HistoryScreen({ onEdit }: HistoryScreenProps) {
  const { entries } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const activeFilterCount = [filters.dateFrom, filters.dateTo, filters.category, filters.comment.trim()].filter(
    Boolean,
  ).length;

  const allCategories = useMemo(
    () => [...new Set(entries.map((e) => e.category))].sort((a, b) => a.localeCompare(b)),
    [entries],
  );

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filters.dateFrom && e.date < filters.dateFrom) return false;
      if (filters.dateTo && e.date > filters.dateTo) return false;
      if (filters.category && e.category !== filters.category) return false;
      if (filters.comment.trim() && !e.comment.toLowerCase().includes(filters.comment.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [entries, filters]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [filtered],
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
      <div className="flex items-center justify-between mt-1 mb-1">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)] px-3 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] active:bg-[var(--surface-2)]"
        >
          <FilterIcon className="w-4 h-4" />
          Filter
          {activeFilterCount > 0 && (
            <span
              className="w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-xs text-[var(--text-muted)] px-2 py-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <FilterField label="From">
              <input
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-[var(--text)] outline-none text-xs"
              />
            </FilterField>
            <FilterField label="To">
              <input
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-[var(--text)] outline-none text-xs"
              />
            </FilterField>
          </div>
          <FilterField label="Category">
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-[var(--text)] outline-none text-xs"
            >
              <option value="">All categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Comment contains">
            <input
              type="text"
              value={filters.comment}
              onChange={(e) => setFilters((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Search comments…"
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-[var(--text)] outline-none text-xs placeholder:text-[var(--text-muted)]/60"
            />
          </FilterField>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] mt-16 text-center">
          {entries.length === 0 ? "No entries yet." : "No entries match your filters."}
        </p>
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

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">{label}</label>
      {children}
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
