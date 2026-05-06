"use client";

import Link from "next/link";
import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Button } from "@runwae/ui/components/button";
import { Skeleton } from "@runwae/ui/components/skeleton";
import { Badge } from "@runwae/ui/components/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@runwae/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@runwae/ui/components/table";

type StatusFilter = Doc<"events">["status"] | "all";

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const STATUS_VARIANT: Record<
  Doc<"events">["status"],
  "default" | "secondary" | "destructive" | "success" | "outline"
> = {
  draft: "outline",
  published: "success",
  cancelled: "destructive",
  completed: "secondary",
};

export default function HostEventsPage() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const { results, status: pageStatus, loadMore } = usePaginatedQuery(
    api.host.events.getMyEvents,
    { status: status === "all" ? undefined : status },
    { initialNumItems: 25 }
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
            Events
          </h1>
          <p className="text-sm text-muted-foreground">
            Your full event catalogue.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/events/create">
            <Plus className="size-4" />
            New event
          </Link>
        </Button>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pageStatus === "LoadingFirstPage" ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No events match this filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Going / Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/events/${e._id}`}
                        className="hover:underline"
                      >
                        {e.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.locationName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(e.startDateUtc).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[e.status]}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {e.currentParticipants} / {e.viewCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pageStatus === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => loadMore(25)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
