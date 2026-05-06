"use client";

import { useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id, Doc } from "@/convex/_generated/dataModel";
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

type Status = Doc<"payouts">["status"] | "all";

const STATUSES: { value: Status; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
];

const STATUS_VARIANT: Record<
  Doc<"payouts">["status"],
  "default" | "secondary" | "destructive" | "success" | "outline"
> = {
  pending: "secondary",
  processing: "default",
  paid: "success",
  failed: "destructive",
};

export default function PayoutsPage() {
  const [status, setStatus] = useState<Status>("pending");
  const { results, status: pageStatus, loadMore } = usePaginatedQuery(
    api.admin.payouts.listAll,
    { status: status === "all" ? undefined : status },
    { initialNumItems: 25 }
  );

  const markProcessing = useMutation(api.admin.payouts.markProcessing);
  const markPaid = useMutation(api.admin.payouts.markPaid);
  const markFailed = useMutation(api.admin.payouts.markFailed);

  const onMarkProcessing = async (id: Id<"payouts">) => {
    try {
      await markProcessing({ payoutId: id });
      toast.success("Marked processing");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const onMarkPaid = async (id: Id<"payouts">) => {
    try {
      await markPaid({ payoutId: id });
      toast.success("Marked paid");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const onMarkFailed = async (id: Id<"payouts">) => {
    try {
      await markFailed({ payoutId: id });
      toast.success("Marked failed; commissions returned to pending");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Payouts
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and process host payout requests.
        </p>
      </div>

      <Tabs
        value={status}
        onValueChange={(v) => setStatus(v as Status)}
      >
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s.value} value={s.value}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pageStatus === "LoadingFirstPage" ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No payouts in this status.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Host</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">
                      {p.host?.name ?? p.host?.email ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {p.amount.toFixed(2)} {p.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[p.status]}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.periodStart).toLocaleDateString()} →{" "}
                      {new Date(p.periodEnd).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {p.status === "pending" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onMarkProcessing(p._id)}
                          >
                            Mark processing
                          </Button>
                        )}
                        {(p.status === "pending" ||
                          p.status === "processing") && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => onMarkPaid(p._id)}
                            >
                              Mark paid
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => onMarkFailed(p._id)}
                            >
                              Fail
                            </Button>
                          </>
                        )}
                      </div>
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
