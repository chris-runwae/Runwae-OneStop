"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePaginatedQuery, useMutation } from "convex/react";
import {
  Eye,
  Grid3x3,
  ImageIcon,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@runwae/ui/components/dropdown-menu";
import { cn } from "@runwae/ui/lib/cn";

type StatusFilter = Doc<"events">["status"] | "all";
type ViewMode = "list" | "grid";

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
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const cancel = useMutation(api.host.events.deleteEvent);

  const { results, status: pageStatus, loadMore } = usePaginatedQuery(
    api.host.events.getMyEvents,
    { status: status === "all" ? undefined : status },
    { initialNumItems: 25 }
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.locationName.toLowerCase().includes(q)
    );
  }, [results, search]);

  async function handleCancel(eventId: Id<"events">) {
    if (!confirm("Cancel this event? This can't be reverted.")) return;
    try {
      await cancel({ eventId });
      toast.success("Event cancelled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
            Your events
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="h-9 w-56 rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="inline-flex h-9 items-center rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-medium transition-colors",
                view === "list"
                  ? "bg-background text-heading shadow"
                  : "text-muted-foreground hover:text-body"
              )}
              aria-label="List view"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-medium transition-colors",
                view === "grid"
                  ? "bg-background text-heading shadow"
                  : "text-muted-foreground hover:text-body"
              )}
              aria-label="Grid view"
            >
              <Grid3x3 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {pageStatus === "LoadingFirstPage" ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            {results.length === 0
              ? "No events match this filter."
              : `No events match “${search}”.`}
          </CardContent>
        </Card>
      ) : view === "list" ? (
        <Card>
          <CardHeader>
            <CardTitle>Catalogue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Going / Views</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
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
                      {new Date(e.startDateUtc).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[e.status]}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {e.currentParticipants} / {e.viewCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        eventId={e._id}
                        onManage={() => router.push(`/events/${e._id}`)}
                        onEdit={() => router.push(`/events/${e._id}/edit`)}
                        onCancel={() => handleCancel(e._id)}
                        canCancel={
                          e.status !== "cancelled" && e.status !== "completed"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <Card key={e._id} className="overflow-hidden">
              <Link href={`/events/${e._id}`} className="block">
                <div className="relative aspect-[16/9] w-full bg-muted">
                  {e.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.imageUrl}
                      alt={e.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="size-8" />
                    </div>
                  )}
                  <Badge
                    variant={STATUS_VARIANT[e.status]}
                    className="absolute left-3 top-3"
                  >
                    {e.status}
                  </Badge>
                </div>
              </Link>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/events/${e._id}`}
                    className="font-medium leading-tight text-heading hover:underline"
                  >
                    {e.name}
                  </Link>
                  <RowActions
                    eventId={e._id}
                    onManage={() => router.push(`/events/${e._id}`)}
                    onEdit={() => router.push(`/events/${e._id}/edit`)}
                    onCancel={() => handleCancel(e._id)}
                    canCancel={
                      e.status !== "cancelled" && e.status !== "completed"
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {e.locationName} ·{" "}
                  {new Date(e.startDateUtc).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3" />
                    {e.currentParticipants}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3" />
                    {e.viewCount}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

function RowActions({
  onManage,
  onEdit,
  onCancel,
  canCancel,
}: {
  eventId: Id<"events">;
  onManage: () => void;
  onEdit: () => void;
  onCancel: () => void;
  canCancel: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0"
          aria-label="Event actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem onSelect={onManage}>Manage</DropdownMenuItem>
        <DropdownMenuItem onSelect={onEdit}>Edit details</DropdownMenuItem>
        {canCancel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onCancel}
              className="text-error focus:text-error"
            >
              Cancel event
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
