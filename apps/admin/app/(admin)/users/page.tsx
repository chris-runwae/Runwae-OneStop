"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePaginatedQuery } from "convex/react";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/data-table";

type User = Doc<"users">;

const PAGE_SIZE = 25;

type TriState = "any" | "only" | "none";

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [suspended, setSuspended] = useState<TriState>("any");
  const [admins, setAdmins] = useState<TriState>("any");

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.users.listAll,
    {
      suspended: suspended === "any" ? undefined : suspended,
      admins: admins === "any" ? undefined : admins,
      search: search.trim() || undefined,
    },
    { initialNumItems: PAGE_SIZE }
  );

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      {
        id: "avatar",
        header: "",
        size: 48,
        cell: ({ row }) => {
          const url = row.original.image ?? row.original.avatarUrl;
          return (
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
              {url ? (
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="36px"
                  unoptimized
                />
              ) : null}
            </div>
          );
        },
      },
      {
        id: "identity",
        header: "Identity",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name ?? "—"}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.email ?? row.original.username ?? "—"}
            </span>
          </div>
        ),
      },
      {
        id: "flags",
        header: "Flags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.isAdmin && <Badge variant="default">Admin</Badge>}
            {row.original.suspendedAt !== undefined && (
              <Badge variant="destructive">Suspended</Badge>
            )}
            {row.original.deletedAt !== undefined && (
              <Badge variant="outline">Deletion pending</Badge>
            )}
            {row.original.isAdmin === undefined &&
              row.original.suspendedAt === undefined &&
              row.original.deletedAt === undefined && (
                <span className="text-xs text-muted-foreground">—</span>
              )}
          </div>
        ),
      },
      {
        id: "createdAt",
        header: "Joined",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : new Date(row.original._creationTime).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
      },
    ],
    []
  );

  const isLoading = status === "LoadingFirstPage";
  const canLoadMore = status === "CanLoadMore";

  return (
    <div className="space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading
            ? "Loading…"
            : `${results.length} user${results.length === 1 ? "" : "s"} loaded`}
          {" · "}
          <span className="text-xs">
            Suspend / unsuspend and grant or revoke admin from the detail page.
          </span>
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or username…"
          className="max-w-sm"
        />
        <select
          value={suspended}
          onChange={(e) => setSuspended(e.target.value as TriState)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Suspended filter"
        >
          <option value="any">Any suspension state</option>
          <option value="only">Suspended only</option>
          <option value="none">Active only</option>
        </select>
        <select
          value={admins}
          onChange={(e) => setAdmins(e.target.value as TriState)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Admin filter"
        >
          <option value="any">Any role</option>
          <option value="only">Admins only</option>
          <option value="none">Non-admins only</option>
        </select>
      </div>

      <DataTable
        data={(results ?? []) as User[]}
        columns={columns}
        emptyState={
          isLoading
            ? "Loading…"
            : search.trim() || suspended !== "any" || admins !== "any"
              ? "No users match the current filters."
              : "No users yet."
        }
        onRowClick={(r) => router.push(`/users/${r.original._id}`)}
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
