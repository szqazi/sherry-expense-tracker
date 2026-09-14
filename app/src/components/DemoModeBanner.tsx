interface DemoModeBannerProps {
  onClear: () => void;
}

export function DemoModeBanner({ onClear }: DemoModeBannerProps) {
  return (
    <div
      className="mx-4 mb-2 flex items-center justify-between gap-2 rounded-lg px-3 py-2 shrink-0"
      style={{ background: "#fbbf24" }}
    >
      <span className="text-xs font-semibold text-[#1a1400]">Viewing demo data</span>
      <button
        onClick={onClear}
        className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#1a1400]/15 text-[#1a1400] active:opacity-70"
      >
        Clear demo data
      </button>
    </div>
  );
}
