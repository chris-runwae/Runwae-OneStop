"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import AccountSettingsTab from "./components/account-settings-tab";
import ActivityTab from "./components/activity-tab";
import NotificationsTab from "./components/notifications-tab";
import PreferencesTab from "./components/preferences-tab";
import PaymentSettingsTab from "./components/payment-settings-tab";
import ProfileTab from "./components/profile-tabs";
import SecuritySettingsTab from "./components/security-settings-tab";
import SettingsTabs from "./components/settings-tabs";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "preference", label: "Preference" },
  { id: "payment", label: "Payment Settings" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security Settings" },
  { id: "account", label: "Account Settings" },
  { id: "activity", label: "Activity" },
];

const TAB_IDS = new Set(tabs.map((t) => t.id));

function getValidTab(tab: string | null): string {
  return tab && TAB_IDS.has(tab) ? tab : "profile";
}

export default function Settings() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo(
    () => getValidTab(searchParams.get("tab")),
    [searchParams],
  );

  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const current = searchParams.get("tab");
    if (!current || !TAB_IDS.has(current)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "profile");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex min-h-full flex-col lg:flex-row"
      orientation="vertical"
    >
      {/* Left sidebar - white background */}
      <aside className="w-full shrink-0 border-r border-border bg-surface lg:w-[280px]">
        <SettingsTabs tabs={tabs} />
      </aside>
      {/* Right content - light grey background */}
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <TabsContent value="profile" className="mt-0 outline-none">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="preference" className="mt-0 outline-none">
          <PreferencesTab />
        </TabsContent>
        <TabsContent value="payment" className="mt-0 outline-none">
          <PaymentSettingsTab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-0 outline-none">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="security" className="mt-0 outline-none">
          <SecuritySettingsTab />
        </TabsContent>
        <TabsContent value="account" className="mt-0 outline-none">
          <AccountSettingsTab />
        </TabsContent>
        <TabsContent value="activity" className="mt-0 outline-none">
          <ActivityTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
