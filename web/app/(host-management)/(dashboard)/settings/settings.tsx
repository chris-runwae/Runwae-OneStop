"use client";

import ProfileTab from "./components/profile-tabs";
import SettingsTabs from "./components/settings-tabs";
import { useState } from "react";

const tabs = [{ id: "profile", label: "Profile" }];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex flex-col gap-10 p-6 sm:flex-row sm:p-8 lg:p-10">
      <SettingsTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="min-w-0 flex-1">
        {activeTab === "profile" && <ProfileTab />}
      </div>
    </div>
  );
}
