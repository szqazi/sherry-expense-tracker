import { useState } from "react";
import { AppProvider } from "./lib/AppContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { TopBar } from "./components/TopBar";
import { EntryScreen } from "./screens/EntryScreen";
import { OverviewScreen } from "./screens/OverviewScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { EditEntryScreen } from "./screens/EditEntryScreen";
import type { Entry } from "./lib/types";

const TAB_TITLES: Record<Tab, string> = {
  entry: "New Entry",
  overview: "Overview",
  history: "History",
};

function Shell() {
  const [tab, setTab] = useState<Tab>("entry");
  const [showSettings, setShowSettings] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  if (editingEntry) {
    return <EditEntryScreen entry={editingEntry} onDone={() => setEditingEntry(null)} />;
  }

  return (
    <div className="w-full max-w-[480px] min-h-svh flex flex-col bg-[var(--app-bg)] relative">
      {showSettings ? (
        <>
          <TopBar title="Settings" onBackClick={() => setShowSettings(false)} />
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <SettingsScreen />
          </div>
        </>
      ) : (
        <>
          <TopBar title={TAB_TITLES[tab]} onSettingsClick={() => setShowSettings(true)} />
          <div className="flex-1 overflow-y-auto flex flex-col">
            {tab === "entry" && <EntryScreen />}
            {tab === "overview" && <OverviewScreen />}
            {tab === "history" && <HistoryScreen onEdit={setEditingEntry} />}
          </div>
          <BottomNav active={tab} onChange={setTab} />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default App;
