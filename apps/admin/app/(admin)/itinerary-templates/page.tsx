"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ConvexError } from "convex/values";
import {
  CheckCircle2,
  CircleDashed,
  MoreHorizontal,
  Plus,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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

type Row = NonNullable<
  ReturnType<typeof useQuery<typeof api.admin.itinerary_templates.listAll>>
>[number];

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export default function ItineraryTemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");
  const [pendingDeleteId, setPendingDeleteId] =
    useState<Id<"itinerary_templates"> | null>(null);

  const rows = useQuery(api.admin.itinerary_templates.listAll, {
    search: search.trim() || undefined,
    featuredOnly: featuredOnly || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const setFeatured = useMutation(api.admin.itinerary_templates.setFeatured);
  const publish = useMutation(api.admin.itinerary_templates.publish);
  const remove = useMutation(api.admin.itinerary_templates.remove);

  const pendingDelete = useMemo(
    () => rows?.find((r) => r._id === pendingDeleteId) ?? null,
    [rows, pendingDeleteId]
  );

  async function handleToggleFeatured(row: Row) {
    try {
      await setFeatured({ id: row._id, isFeatured: !row.isFeatured });
      toast.success(
        !row.isFeatured ? "Marked as featured" : "Removed from featured"
      );
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function handleTogglePublish(row: Row) {
    try {
      await publish({
        id: row._id,
        status: row.status === "published" ? "draft" : "published",
      });
      toast.success(
        row.status === "published" ? "Reverted to draft" : "Published"
      );
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove({ id: pendingDelete._id });
      toast.success(`Deleted “${pendingDelete.title}”`);
      setPendingDeleteId(null);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        id: "cover",
        header: "",
        size: 64,
        cell: ({ row }) => {
          const url = row.original.coverImageUrl;
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
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.title}</span>
            {row.original.category && (
              <span className="text-xs text-muted-foreground">
                {row.original.category}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "destination",
        header: "Destination",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.destination
              ? `${row.original.destination.name}, ${row.original.destination.country}`
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "durationDays",
        header: "Days",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.durationDays}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.status === "published" ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Published
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <CircleDashed className="h-3 w-3" /> Draft
            </Badge>
          ),
      },
      {
        id: "featured",
        header: "Featured",
        cell: ({ row }) =>
          row.original.isFeatured ? (
            <Badge variant="default">Featured</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "timesCopied",
        header: "Copies",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">{row.original.timesCopied}</span>
        ),
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
                    router.push(`/itinerary-templates/${row.original._id}`)
                  }
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => void handleTogglePublish(row.original)}
                >
                  {row.original.status === "published" ? (
                    <>
                      <CircleDashed className="mr-2 h-4 w-4" /> Revert to draft
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Publish
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => void handleToggleFeatured(row.original)}
                >
                  {row.original.isFeatured ? (
                    <>
                      <StarOff className="mr-2 h-4 w-4" /> Unfeature
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" /> Mark as featured
                    </>
                  )}
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

  return (
    <div className="space-y-6 p-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Itinerary Templates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows
              ? `${rows.length} template${rows.length === 1 ? "" : "s"}`
              : "Loading…"}
          </p>
        </div>
        <Button asChild>
          <Link href="/itinerary-templates/new">
            <Plus className="mr-1 h-4 w-4" /> New Template
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
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "draft" | "published")
          }
          className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            id="featured-only"
            checked={featuredOnly}
            onCheckedChange={setFeaturedOnly}
          />
          <Label htmlFor="featured-only" className="text-sm">
            Featured only
          </Label>
        </div>
      </div>

      <DataTable
        data={rows ?? []}
        columns={columns}
        emptyState={
          rows === undefined
            ? "Loading…"
            : search.trim() || featuredOnly || statusFilter !== "all"
              ? "No templates match the current filters."
              : "No templates yet. Create one to get started."
        }
        onRowClick={(r) =>
          router.push(`/itinerary-templates/${r.original._id}`)
        }
      />

      <Dialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(o) => !o && setPendingDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete template?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `“${pendingDelete.title}” will be permanently deleted. Trips already cloned from it keep their copy.`
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
