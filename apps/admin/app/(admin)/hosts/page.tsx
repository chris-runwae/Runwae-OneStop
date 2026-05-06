"use client";

import Link from "next/link";
import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Input } from "@runwae/ui/components/input";
import { Button } from "@runwae/ui/components/button";
import { Badge } from "@runwae/ui/components/badge";
import { Skeleton } from "@runwae/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@runwae/ui/components/table";

export default function HostsPage() {
  const [search, setSearch] = useState("");
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.users.listAll,
    { hosts: "only", search: search.trim() || undefined },
    { initialNumItems: 25 }
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
            Hosts
          </h1>
          <p className="text-sm text-muted-foreground">
            Approved event hosts. Search by name, email, or username.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/hosts/applications">Pending applications</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>All hosts</CardTitle>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hosts…"
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent className="p-0">
          {status === "LoadingFirstPage" ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No hosts found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Host</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/hosts/${u._id}`}
                        className="hover:underline"
                      >
                        {u.name ?? "—"}
                      </Link>
                      {u.username && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          @{u.username}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email ?? "—"}
                    </TableCell>
                    <TableCell>
                      {u.suspendedAt ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="size-3" />
                          Suspended
                        </Badge>
                      ) : (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="size-3" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadMore(25)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
