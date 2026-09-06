export function todayStr(): string {
  const d = new Date();
  return toDateStr(d);
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleString(undefined, {
    month: "short",
  });
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function currentMonthIndex(): number {
  return new Date().getMonth();
}

// Monday of the week containing `d` (week runs Mon-Sun).
export function startOfWeek(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = copy.getDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  copy.setDate(copy.getDate() + diffToMonday);
  return copy;
}

export function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

export function startOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex, 1);
}

export function endOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0);
}

export function weekRangeLabel(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString(undefined, { day: "numeric", month: sameMonth ? undefined : "short" });
  const endLabel = end.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}
