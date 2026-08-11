import { useState } from "react";
import { AppProvider } from "./lib/AppContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { TopBar } from "./components/TopBar";
import { EntryScreen } from "./screens/EntryScreen";
import { OverviewScreen } from "./screens/OverviewScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

function Shell() {
  const [tab, setTab] = useState<Tab>("entry");
  const [showSettings, setShowSettings] = useState(false);

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
          <TopBar
            title={tab === "entry" ? "New Entry" : "Overview"}
            onSettingsClick={() => setShowSettings(true)}
          />
          <div className="flex-1 overflow-y-auto flex flex-col">
            {tab === "entry" ? <EntryScreen /> : <OverviewScreen />}
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
