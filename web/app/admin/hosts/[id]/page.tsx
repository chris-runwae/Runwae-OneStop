"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HostProfileHeader, type HostDetail } from "../components/host-profile-header";
import { OverviewTab } from "../components/overview-tab";
import { EventsTab } from "../components/events-tab";
import { BookingsTab } from "../components/bookings-tab";
import { EarningsTab } from "../components/earnings-tab";
import { SettingsTab } from "../components/settings-tab";
import { SuspendModal } from "../components/suspend-modal";
import { adminGetUserById } from "@/lib/supabase/admin/users";
import { adminGetEventsByHostId } from "@/lib/supabase/admin/events";
import { adminGetBookingsByEventIds } from "@/lib/supabase/admin/hotel-bookings";
import { toast } from "sonner";

export default function HostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [suspendOpen, setSuspendOpen] = useState(false);

  const { data: hostProfile, isPending: hostLoading } = useQuery({
    queryKey: ["admin-host", id],
    queryFn: () => adminGetUserById(id),
    enabled: !!id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["admin-host-events", id],
    queryFn: () => adminGetEventsByHostId(id),
    enabled: !!id,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-host-bookings", id],
    queryFn: () => adminGetBookingsByEventIds(events.map((e) => e.id)),
    enabled: events.length > 0,
  });

  if (hostLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-sm text-muted-foreground">
        Loading host…
      </div>
    );
  }

  if (!hostProfile) {
    return (
      <div className="flex items-center justify-center py-32 text-sm text-rose-500">
        Host not found.
      </div>
    );
  }

  const host: HostDetail = {
    id: hostProfile.id,
    name: hostProfile.full_name ?? hostProfile.email ?? "Unknown",
    email: hostProfile.email ?? "—",
    phone: "—",
    status: "Active",
    avatarUrl: hostProfile.avatar_url ?? undefined,
  };

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

        <HostProfileHeader host={host} onSuspend={() => setSuspendOpen(true)} />

        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab host={hostProfile} events={events} bookings={bookings} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsTab events={events} />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingsTab bookings={bookings} events={events} />
          </TabsContent>

          <TabsContent value="earnings" className="mt-6">
            <EarningsTab bookings={bookings} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab events={events} />
          </TabsContent>
        </Tabs>
      </div>

      <SuspendModal
        hostName={host.name}
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        onConfirm={(reason) => {
          toast.info(`Suspend action recorded: ${reason}`);
          setSuspendOpen(false);
        }}
      />
    </>
  );
}
