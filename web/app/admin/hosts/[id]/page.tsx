"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HostProfileHeader, type HostDetail } from "../components/host-profile-header";
import { OverviewTab } from "../components/overview-tab";
import { EventsTab } from "../components/events-tab";
import { BookingsTab } from "../components/bookings-tab";
import { EarningsTab } from "../components/earnings-tab";
import { SettingsTab } from "../components/settings-tab";
import { SuspendModal } from "../components/suspend-modal";

const MOCK_HOST: HostDetail = {
  id: "HST-0001",
  name: "Christopher Jones",
  email: "christopher.jones@gmail.com",
  phone: "+1 (23) 1000000",
  status: "Active",
};

export default function HostDetailPage() {
  const [suspendOpen, setSuspendOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        {/* Back */}
        <Link
          href="/admin/hosts"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-black transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to Hosts
        </Link>

        <div>
          <h1 className="font-display text-2xl font-bold text-black">Hosts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage Event Hosts and their activities.</p>
        </div>

        <HostProfileHeader host={MOCK_HOST} onSuspend={() => setSuspendOpen(true)} />

        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsTab />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="earnings" className="mt-6">
            <EarningsTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      <SuspendModal
        hostName={MOCK_HOST.name}
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        onConfirm={(reason) => console.log("Suspend reason:", reason)}
      />
    </>
  );
}
