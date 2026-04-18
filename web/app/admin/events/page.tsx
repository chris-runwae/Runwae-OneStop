import Link from "next/link";
import { ROUTES } from "@/app/routes";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { EventsTable } from "./components/events-table";

export default function AdminEventsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-black">Events</h1>
        <Link
          href={ROUTES.host.eventsCreate}
          className={cn(buttonVariants({ variant: "primary", size: "default" }), "gap-2")}
        >
          <Plus className="size-4" />
          Create Event
        </Link>
      </div>
      <EventsTable />
    </div>
  );
}
