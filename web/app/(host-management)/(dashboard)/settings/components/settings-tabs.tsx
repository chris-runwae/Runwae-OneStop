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
    <div className="flex w-[206px] shrink-0 flex-col gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`w-full rounded-xl px-6 py-4 text-left font-display text-base font-medium ${
            tab.id === activeTab
              ? "bg-page text-muted"
              : "text-muted hover:bg-page/50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
