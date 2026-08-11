import { monthLabel } from "../lib/dateUtils";

interface MonthPickerProps {
  year: number;
  monthIndex: number;
  onChange: (year: number, monthIndex: number) => void;
  disableFuture?: boolean;
}

export function MonthPicker({ year, monthIndex, onChange, disableFuture = true }: MonthPickerProps) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && monthIndex === now.getMonth();

  function go(delta: number) {
    let m = monthIndex + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    onChange(y, m);
  }

  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <button
        onClick={() => go(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
        aria-label="Previous month"
      >
        ‹
      </button>
      <span className="text-sm font-medium text-[var(--text)] min-w-[110px] text-center">
        {monthLabel(year, monthIndex)} {year}
      </span>
      <button
        onClick={() => go(1)}
        disabled={disableFuture && isCurrentMonth}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)] disabled:opacity-30"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}

export function YearPicker({
  year,
  onChange,
}: {
  year: number;
  onChange: (year: number) => void;
}) {
  const now = new Date();
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <button
        onClick={() => onChange(year - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
        aria-label="Previous year"
      >
        ‹
      </button>
      <span className="text-sm font-medium text-[var(--text)] min-w-[60px] text-center">{year}</span>
      <button
        onClick={() => onChange(year + 1)}
        disabled={year >= now.getFullYear()}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)] disabled:opacity-30"
        aria-label="Next year"
      >
        ›
      </button>
    </div>
  );
}
