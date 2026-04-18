"use client";

import Link from "next/link";
import { ChevronLeft, Edit2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventOverviewTab } from "./components/overview-tab";
import { AttendeesTab } from "./components/attendees-tab";

const EVENT_ACTIONS = [
  "Add Admin Note",
  "Feature on Homepage",
  "Issue Ref'lc",
  "Go Event",
  "Unpublish Event",
] as const;

export default function AdminEventDetailPage() {
  const [_adminNote, setAdminNote] = useState("");

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/events"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-black transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to Events
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-body hover:bg-muted/40 transition-colors"
          >
            <Edit2 className="size-3.5" /> Edit event
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg border border-border text-body hover:bg-muted/40 transition-colors"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {EVENT_ACTIONS.map((action) => (
                <DropdownMenuItem
                  key={action}
                  className={`cursor-pointer text-sm ${action === "Unpublish Event" ? "text-rose-500 focus:text-rose-500" : ""}`}
                >
                  {action}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl font-bold text-black">Afrobeat Fest</h1>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <EventOverviewTab />
        </TabsContent>

        <TabsContent value="attendees" className="mt-6">
          <AttendeesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
