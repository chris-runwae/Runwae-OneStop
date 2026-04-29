"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, usePaginatedQuery } from "convex/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ConvexError } from "convex/values";
import { Flame, FlameKindling, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";

type EventStatus = Doc<"events">["status"];
type EventRow = Doc<"events"> & {
  host: { _id: Id<"users">; name: string | null; email: string | null } | null;
};

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

const STATUS_BADGE: Record<EventStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  published: { label: "Published", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  completed: { label: "Completed", variant: "secondary" },
};

const PAGE_SIZE = 25;

export default function EventsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EventStatus>("all");
  const [trendingOnly, setTrendingOnly] = useState(false);

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.events.listAll,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      trendingOnly: trendingOnly || undefined,
      search: search.trim() || undefined,
    },
    { initialNumItems: PAGE_SIZE }
  );

  const setTrending = useMutation(api.admin.events.setTrending);

  async function handleToggleTrending(row: EventRow) {
    try {
      await setTrending({
        eventId: row._id,
        isTrending: !row.isTrending,
      });
      toast.success(!row.isTrending ? "Marked as trending" : "Removed from trending");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const columns = useMemo<ColumnDef<EventRow, unknown>[]>(
    () => [
      {
        id: "image",
        header: "",
        size: 64,
        cell: ({ row }) => {
          const url = row.original.imageUrl ?? row.original.imageUrls[0];
          return (
            <div className="relative h-10 w-14 overflow-hidden rounded bg-muted">
              {url ? (
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.locationName}
            </span>
          </div>
        ),
      },
      {
        id: "host",
        header: "Host",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.host?.name ?? row.original.host?.email ?? "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = STATUS_BADGE[row.original.status];
          return <Badge variant={s.variant}>{s.label}</Badge>;
        },
      },
      {
        id: "trending",
        header: "Trending",
        cell: ({ row }) =>
          row.original.isTrending ? (
            <Badge variant="default" className="gap-1">
              <Flame className="h-3 w-3" />#{row.original.trendingRank ?? "—"}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "startDateUtc",
        header: "Start",
        cell: ({ row }) =>
          new Date(row.original.startDateUtc).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
      {
        id: "actions",
        header: "",
        size: 56,
        cell: ({ row }) => (
          <div data-row-action className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Row actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => router.push(`/events/${row.original._id}`)}
                >
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => void handleToggleTrending(row.original)}
                >
                  {row.original.isTrending ? (
                    <>
                      <FlameKindling className="mr-2 h-4 w-4" /> Untrend
                    </>
                  ) : (
                    <>
                      <Flame className="mr-2 h-4 w-4" /> Mark trending
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [router]
  );

  const isLoading = status === "LoadingFirstPage";
  const canLoadMore = status === "CanLoadMore";

  return (
    <div className="space-y-6 p-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${results.length} event${results.length === 1 ? "" : "s"} loaded`}
            {" · "}
            <span className="text-xs">
              Hosts create events from the consumer app — admin curates trending and status.
            </span>
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or location…"
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            id="trending-only"
            checked={trendingOnly}
            onCheckedChange={setTrendingOnly}
          />
          <Label htmlFor="trending-only" className="text-sm">
            Trending only
          </Label>
        </div>
      </div>

      <DataTable
        data={(results ?? []) as EventRow[]}
        columns={columns}
        emptyState={
          isLoading
            ? "Loading…"
            : search.trim() || statusFilter !== "all" || trendingOnly
              ? "No events match the current filters."
              : "No events yet. Run the dev seed to populate."
        }
        onRowClick={(r) => router.push(`/events/${r.original._id}`)}
      />

      {canLoadMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadMore(PAGE_SIZE)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
