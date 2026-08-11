import { BackIcon, GearIcon } from "./Icons";

interface TopBarProps {
  title: string;
  onSettingsClick?: () => void;
  onBackClick?: () => void;
}

export function TopBar({ title, onSettingsClick, onBackClick }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),16px)] pb-3 shrink-0">
      <div className="w-9 flex items-center">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="w-9 h-9 -ml-2 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
            aria-label="Back"
          >
            <BackIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <h1 className="text-[15px] font-medium tracking-wide text-[var(--text)] uppercase">{title}</h1>
      <div className="w-9 flex items-center justify-end">
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
            aria-label="Settings"
          >
            <GearIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
