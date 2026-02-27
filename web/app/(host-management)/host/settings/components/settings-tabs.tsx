export interface SettingsTab {
  id: string;
  label: string;
}

export interface SettingsTabsProps {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SettingsTabs({
  tabs,
  activeTab,
  onTabChange,
}: SettingsTabsProps) {
  return (
    <div className="flex flex-col gap-1 p-6 lg:p-6">
      <h2 className="mb-4 font-display text-xl font-bold text-black">
        Settings
      </h2>
      <nav className="flex flex-col gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`w-full rounded-xl px-6 py-4 text-left font-display text-base font-medium transition-colors ${
              tab.id === activeTab
                ? "bg-page text-black"
                : "text-muted-foreground hover:bg-page/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
