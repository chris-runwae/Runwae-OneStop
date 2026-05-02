"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, usePaginatedQuery } from "convex/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ConvexError } from "convex/values";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";

type EntityType = Doc<"collections">["entityType"];
type Row = Doc<"collections"> & { entityCount: number };

const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  event: "Events",
  destination: "Destinations",
  experience: "Experiences",
  trip: "Trips",
};

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

const PAGE_SIZE = 25;

export default function CollectionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<"all" | EntityType>(
    "all"
  );
  const [activeOnly, setActiveOnly] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] =
    useState<Id<"collections"> | null>(null);

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.collections.listAll,
    {
      entityType: entityTypeFilter === "all" ? undefined : entityTypeFilter,
      activeOnly: activeOnly || undefined,
      search: search.trim() || undefined,
    },
    { initialNumItems: PAGE_SIZE }
  );

  const remove = useMutation(api.admin.collections.remove);

  const pendingDelete = useMemo(
    () => results.find((r) => r._id === pendingDeleteId) ?? null,
    [results, pendingDeleteId]
  );

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove({ id: pendingDelete._id });
      toast.success(`Deleted "${pendingDelete.title}"`);
      setPendingDeleteId(null);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.title}</span>
            {row.original.description && (
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {row.original.description}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "entityType",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {ENTITY_TYPE_LABEL[row.original.entityType]}
          </Badge>
        ),
      },
      {
        accessorKey: "entityCount",
        header: "Items",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.entityCount}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Live",
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          ),
      },
      {
        accessorKey: "rank",
        header: "Rank",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.rank}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("en-GB", {
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
                  onSelect={() =>
                    router.push(`/collections/${row.original._id}`)
                  }
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setPendingDeleteId(row.original._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
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
          <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${results.length} collection${results.length === 1 ? "" : "s"} loaded`}
          </p>
        </div>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="mr-1 h-4 w-4" /> New Collection
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          className="max-w-xs"
        />
        <select
          value={entityTypeFilter}
          onChange={(e) =>
            setEntityTypeFilter(e.target.value as typeof entityTypeFilter)
          }
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All types</option>
          <option value="event">Events</option>
          <option value="destination">Destinations</option>
          <option value="experience">Experiences</option>
          <option value="trip">Trips</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            id="active-only"
            checked={activeOnly}
            onCheckedChange={setActiveOnly}
          />
          <Label htmlFor="active-only" className="text-sm">
            Active only
          </Label>
        </div>
      </div>

      <DataTable
        data={(results ?? []) as Row[]}
        columns={columns}
        emptyState={
          isLoading
            ? "Loading…"
            : search.trim() || entityTypeFilter !== "all" || activeOnly
              ? "No collections match the current filters."
              : "No collections yet. Create one to get started."
        }
        onRowClick={(r) => router.push(`/collections/${r.original._id}`)}
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

      <Dialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(o) => !o && setPendingDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete collection?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `"${pendingDelete.title}" will be hard-deleted. Collections schema has no soft-delete; this can't be undone from the UI.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
