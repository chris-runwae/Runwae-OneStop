"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ConvexError } from "convex/values";
import { MoreHorizontal, Plus, Star, StarOff, Trash2 } from "lucide-react";
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

type Destination = Doc<"destinations">;

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export default function DestinationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<Id<"destinations"> | null>(null);

  const rows = useQuery(api.admin.destinations.listAll, {
    search: search.trim() || undefined,
    featuredOnly: featuredOnly || undefined,
  });

  const setFeatured = useMutation(api.admin.destinations.setFeatured);
  const softDelete = useMutation(api.admin.destinations.softDelete);

  const pendingDelete = useMemo(
    () => rows?.find((r) => r._id === pendingDeleteId) ?? null,
    [rows, pendingDeleteId]
  );

  async function handleToggleFeatured(row: Destination) {
    try {
      await setFeatured({
        id: row._id,
        isFeatured: !row.isFeatured,
        featuredRank: !row.isFeatured ? undefined : undefined,
      });
      toast.success(
        !row.isFeatured ? "Marked as featured" : "Removed from featured"
      );
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await softDelete({ id: pendingDelete._id });
      toast.success(`Deleted “${pendingDelete.name}”`);
      setPendingDeleteId(null);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const columns = useMemo<ColumnDef<Destination, unknown>[]>(
    () => [
      {
        id: "hero",
        header: "",
        size: 64,
        cell: ({ row }) => {
          const url = row.original.heroImageUrl;
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
              {row.original.slug}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.country}
            {row.original.region ? ` · ${row.original.region}` : ""}
          </span>
        ),
      },
      {
        id: "featured",
        header: "Featured",
        cell: ({ row }) =>
          row.original.isFeatured ? (
            <Badge variant="default">
              #{row.original.featuredRank ?? "—"}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {(row.original.tags ?? []).slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {t}
              </Badge>
            ))}
            {row.original.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{row.original.tags.length - 3}
              </span>
            )}
          </div>
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
                    router.push(`/destinations/${row.original._id}`)
                  }
                >
                  Edit
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
          <h1 className="text-2xl font-semibold tracking-tight">Destinations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows ? `${rows.length} active destination${rows.length === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <Button asChild>
          <Link href="/destinations/new">
            <Plus className="mr-1 h-4 w-4" /> New Destination
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="max-w-xs"
        />
        <div className="ml-auto flex items-center gap-2">
          <Switch
            id="featured-only"
            checked={featuredOnly}
            onCheckedChange={setFeaturedOnly}
          />
          <Label htmlFor="featured-only" className="text-sm">
            Show featured only
          </Label>
        </div>
      </div>

      <DataTable
        data={rows ?? []}
        columns={columns}
        emptyState={
          rows === undefined
            ? "Loading…"
            : search.trim() || featuredOnly
              ? "No destinations match the current filters."
              : "No destinations yet. Create one to get started."
        }
        onRowClick={(r) => router.push(`/destinations/${r.original._id}`)}
      />

      <Dialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(o) => !o && setPendingDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete destination?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `“${pendingDelete.name}” will be soft-deleted and hidden from the public site. You can restore it later from the database.`
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
