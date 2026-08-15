import { EntryTabIcon, HistoryTabIcon, OverviewTabIcon } from "./Icons";

export type Tab = "entry" | "overview" | "history";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] pb-[max(env(safe-area-inset-bottom),8px)]">
      <div className="flex">
        <NavButton
          label="Entry"
          isActive={active === "entry"}
          icon={<EntryTabIcon className="w-5 h-5" />}
          onClick={() => onChange("entry")}
        />
        <NavButton
          label="Overview"
          isActive={active === "overview"}
          icon={<OverviewTabIcon className="w-5 h-5" />}
          onClick={() => onChange("overview")}
        />
        <NavButton
          label="History"
          isActive={active === "history"}
          icon={<HistoryTabIcon className="w-5 h-5" />}
          onClick={() => onChange("history")}
        />
      </div>
    </div>
  );
}

function NavButton({
  label,
  isActive,
  icon,
  onClick,
}: {
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 pt-2.5 pb-1 transition-colors ${
        isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}
