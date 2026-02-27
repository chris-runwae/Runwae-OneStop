"use client";

import ProfileTab from "./components/profile-tabs";
import SettingsTabs from "./components/settings-tabs";
import { useState } from "react";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "preference", label: "Preference" },
  { id: "payment", label: "Payment Settings" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security Settings" },
  { id: "activity", label: "Activity" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      {/* Left sidebar - white background */}
      <aside className="w-full shrink-0 border-r border-border bg-surface lg:w-[280px]">
        <SettingsTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </aside>
      {/* Right content - light grey background */}
      <div className="min-w-0 flex-1 p-6 sm:p-8 lg:p-10">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab !== "profile" && (
          <p className="text-muted-foreground">
            This section is coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
