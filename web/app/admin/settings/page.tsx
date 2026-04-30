"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GeneralTab } from "./tabs/general-tab";
import { CommissionTab } from "./tabs/commission-tab";
import { SubscriptionTab } from "./tabs/subscription-tab";
import { PaymentsTab } from "./tabs/payments-tab";
import { TeamTab } from "./tabs/team-tab";

const TABS = [
  { id: "general", label: "General" },
  { id: "commission", label: "Commission Rate" },
  { id: "subscription", label: "Subscription Plans" },
  { id: "payments", label: "Payments" },
  { id: "team", label: "Team" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-black">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure platform settings and preferences.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-0 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 border-b-2 px-5 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-body",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-100">
        {activeTab === "general" && <GeneralTab />}
        {activeTab === "commission" && <CommissionTab />}
        {activeTab === "subscription" && <SubscriptionTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "team" && <TeamTab />}
      </div>
    </div>
  );
}
