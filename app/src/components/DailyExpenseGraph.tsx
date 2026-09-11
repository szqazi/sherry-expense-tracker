import { useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "../lib/AppContext";
import { dailyExpenses } from "../lib/aggregations";
import { formatAmount, formatCompactNumber } from "../lib/currency";
import { endOfMonth, endOfWeek, monthLabel, startOfMonth, startOfWeek, weekRangeLabel } from "../lib/dateUtils";

type Mode = "week" | "month";

const WEEKEND_COLOR = "#fbbf24";
const SWIPE_THRESHOLD = 40;

interface DailyExpenseGraphProps {
  onDayClick?: (date: string) => void;
}

export function DailyExpenseGraph({ onDayClick }: DailyExpenseGraphProps) {
  const { entries, currency, settings } = useApp();
  const [mode, setMode] = useState<Mode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const { rangeStart, rangeEnd, label } = useMemo(() => {
    if (mode === "week") {
      const start = startOfWeek(anchor);
      const end = endOfWeek(anchor);
      return { rangeStart: start, rangeEnd: end, label: weekRangeLabel(start, end) };
    }
    const start = startOfMonth(anchor.getFullYear(), anchor.getMonth());
    const end = endOfMonth(anchor.getFullYear(), anchor.getMonth());
    return { rangeStart: start, rangeEnd: end, label: `${monthLabel(anchor.getFullYear(), anchor.getMonth())} ${anchor.getFullYear()}` };
  }, [mode, anchor]);

  const days = dailyExpenses(entries, rangeStart, rangeEnd, currency, settings.exchangeRates);
  const total = days.reduce((a, d) => a + d.expense, 0);

  const chartData = days.map((d) => ({
    label: mode === "week" ? d.date.slice(5).split("-").reverse().join("/") : String(d.dayOfMonth),
    date: d.date,
    expense: Math.round(d.expense),
    isWeekend: d.isWeekend,
  }));

  const nextRangeStart =
    mode === "week"
      ? startOfWeek(nextAnchor(anchor, mode, 1))
      : startOfMonth(nextAnchor(anchor, mode, 1).getFullYear(), nextAnchor(anchor, mode, 1).getMonth());
  const canGoNext = nextRangeStart <= new Date();

  function go(dir: 1 | -1) {
    setAnchor((prev) => nextAnchor(prev, mode, dir));
  }

  function handleModeChange(next: Mode) {
    setMode(next);
    setAnchor(new Date());
  }

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) {
      if (canGoNext) go(1);
    } else {
      go(-1);
    }
  }

  return (
    <div className="flex flex-col px-5">
      <div className="flex bg-[var(--surface)] rounded-full p-1 mb-4 max-w-[220px] mx-auto w-full">
        <ModeButton label="Week" active={mode === "week"} onClick={() => handleModeChange("week")} />
        <ModeButton label="Month" active={mode === "month"} onClick={() => handleModeChange("month")} />
      </div>

      <div className="flex items-center justify-center gap-4 mb-1">
        <button
          onClick={() => go(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
          aria-label="Previous"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-[var(--text)] min-w-[160px] text-center">{label}</span>
        <button
          onClick={() => go(1)}
          disabled={!canGoNext}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)] disabled:opacity-30"
          aria-label="Next"
        >
          ›
        </button>
      </div>
      <p className="text-center text-[11px] text-[var(--text-muted)] mb-4">swipe the chart to change {mode}</p>

      <div className="flex items-center gap-4 mb-2 text-xs text-[var(--text-muted)] justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--accent)" }} /> Weekday
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: WEEKEND_COLOR }} /> Weekend
        </span>
      </div>

      <div className="w-full h-[240px]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              interval={mode === "month" ? 2 : 0}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
              tickFormatter={formatCompactNumber}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: "var(--text)" }}
              formatter={(value) => formatAmount(Number(value), currency)}
            />
            <Bar
              dataKey="expense"
              radius={[3, 3, 0, 0]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(data: any) => onDayClick?.(data.payload?.date ?? data.date ?? "")}
              cursor={onDayClick ? "pointer" : undefined}
            >
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.isWeekend ? WEEKEND_COLOR : "var(--accent)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center mt-4">
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Total</span>
        <div className="text-xl font-semibold text-[var(--text)]">{formatAmount(total, currency)}</div>
      </div>
    </div>
  );
}

function nextAnchor(current: Date, mode: Mode, dir: 1 | -1): Date {
  if (mode === "week") {
    const next = new Date(current);
    next.setDate(next.getDate() + 7 * dir);
    return next;
  }
  return new Date(current.getFullYear(), current.getMonth() + dir, 15);
}

function ModeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${
        active ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)]"
      }`}
    >
      {label}
    </button>
  );
}
