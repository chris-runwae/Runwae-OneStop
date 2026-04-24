"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface SettingsTab {
  id: string;
  label: string;
}

export interface SettingsTabsProps {
  tabs: SettingsTab[];
}

export default function SettingsTabs({ tabs }: SettingsTabsProps) {
  return (
    <div className="flex flex-col gap-1 p-4 sm:p-6">
      <h2 className="mb-4 font-display text-xl font-bold text-black">
        Settings
      </h2>
      <TabsList
        variant="line"
        className="h-auto w-full flex-col items-stretch justify-start rounded-none bg-transparent p-0 gap-0"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="w-full justify-start rounded-xl px-6 py-4 text-left font-display text-base font-medium data-[state=active]:bg-page data-[state=active]:text-black data-[state=inactive]:text-muted-foreground hover:bg-page/50"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
