"use client";

import Link from "next/link";
import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
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
import { Input } from "@runwae/ui/components/input";
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

type StatusFilter = Doc<"support_tickets">["status"] | "all";

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_VARIANT: Record<
  Doc<"support_tickets">["priority"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  low: "outline",
  normal: "secondary",
  high: "default",
  urgent: "destructive",
};

export default function SupportPage() {
  const [status, setStatus] = useState<StatusFilter>("open");
  const [search, setSearch] = useState("");
  const { results, status: pageStatus, loadMore } = usePaginatedQuery(
    api.admin.support.listTickets,
    {
      status: status === "all" ? undefined : status,
      search: search.trim() || undefined,
    },
    { initialNumItems: 25 }
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Support
        </h1>
        <p className="text-sm text-muted-foreground">
          User-opened tickets across the platform.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subject or description…"
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pageStatus === "LoadingFirstPage" ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No tickets in this view.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/support/${t._id}`}
                        className="hover:underline"
                      >
                        {t.subject}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.reporter?.name ?? t.reporter?.email ?? "—"}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {t.category}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_VARIANT[t.priority]}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {t.status.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(t.updatedAt).toLocaleString()}
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
