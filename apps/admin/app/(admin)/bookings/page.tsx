"use client";

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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@runwae/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@runwae/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@runwae/ui/components/table";

type Status = Doc<"bookings">["status"] | "all";
type BookingType = Doc<"bookings">["type"] | "all";

const STATUS_VARIANT: Record<
  Doc<"bookings">["status"],
  "default" | "secondary" | "destructive" | "success" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
  completed: "success",
};

const TABS: { value: Status; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPES: { value: BookingType; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "event_ticket", label: "Event ticket" },
  { value: "hotel", label: "Hotel" },
  { value: "flight", label: "Flight" },
  { value: "tour", label: "Tour" },
  { value: "car_rental", label: "Car rental" },
];

export default function BookingsPage() {
  const [status, setStatus] = useState<Status>("all");
  const [type, setType] = useState<BookingType>("all");
  const { results, status: pageStatus, loadMore } = usePaginatedQuery(
    api.admin.bookings.listAll,
    {
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
    },
    { initialNumItems: 25 }
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Bookings
        </h1>
        <p className="text-sm text-muted-foreground">
          Every booking transacted through Runwae.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as Status)}
        >
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={type} onValueChange={(v) => setType(v as BookingType)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pageStatus === "LoadingFirstPage" ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No bookings match this filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Event / Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Booked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="font-medium">
                      {b.user?.name ?? b.user?.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.event?.name ?? b.apiSource}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {b.type.replace("_", " ")}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {b.grossAmount.toFixed(2)} {b.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[b.status]}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(b.bookedAt).toLocaleString()}
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
