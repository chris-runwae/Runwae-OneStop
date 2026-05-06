"use client";

import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@runwae/ui/components/table";

const STATUS_VARIANT: Record<
  Doc<"payouts">["status"],
  "default" | "secondary" | "destructive" | "success" | "outline"
> = {
  pending: "secondary",
  processing: "default",
  paid: "success",
  failed: "destructive",
};

export default function HostPayoutsPage() {
  const payouts = useQuery(api.host.payouts.listMyPayouts, {});
  const earnings = useQuery(api.commissions.getHostEarnings, {});
  const requestPayout = useMutation(api.host.payouts.requestPayout);

  const onRequest = async () => {
    try {
      await requestPayout({});
      toast.success("Payout requested — admin will review.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
            Payouts
          </h1>
          <p className="text-sm text-muted-foreground">
            Withdraw your pending earnings.
          </p>
        </div>
        <Button
          onClick={onRequest}
          disabled={!earnings || earnings.pending <= 0}
        >
          Request payout
          {earnings?.pending !== undefined && earnings.pending > 0 &&
            ` (£${earnings.pending.toFixed(2)})`}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payouts === undefined ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No payouts yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {p.amount.toFixed(2)} {p.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[p.status]}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(p.periodStart).toLocaleDateString()} →{" "}
                      {new Date(p.periodEnd).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
