"use client";

import { useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import { Button } from "@runwae/ui/components/button";
import { Skeleton } from "@runwae/ui/components/skeleton";
import { Textarea } from "@runwae/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@runwae/ui/components/dialog";

export default function HostApplicationsPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.host_applications.listPending,
    {},
    { initialNumItems: 25 }
  );
  const approve = useMutation(api.admin.host_applications.approve);
  const reject = useMutation(api.admin.host_applications.reject);

  const [rejectingId, setRejectingId] = useState<Id<"host_applications"> | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");

  const onApprove = async (id: Id<"host_applications">) => {
    try {
      await approve({ applicationId: id });
      toast.success("Host approved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to approve");
    }
  };

  const onSubmitReject = async () => {
    if (!rejectingId) return;
    try {
      await reject({
        applicationId: rejectingId,
        reason: rejectReason.trim() || undefined,
      });
      toast.success("Application rejected");
      setRejectingId(null);
      setRejectReason("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reject");
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Host applications
        </h1>
        <p className="text-sm text-muted-foreground">
          Approve or reject pending host requests.
        </p>
      </div>

      {status === "LoadingFirstPage" ? (
        <Card>
          <CardContent className="space-y-2 p-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No pending applications.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {results.map((app) => (
            <Card key={app._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4">
                  <span>
                    {app.applicant?.name ??
                      app.applicant?.email ??
                      "Unknown applicant"}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {new Date(app.createdAt).toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {app.applicant?.email && (
                  <p className="text-muted-foreground">
                    {app.applicant.email}
                  </p>
                )}
                {app.bio && <p>{app.bio}</p>}
                {app.payoutCountry && (
                  <p className="text-xs text-muted-foreground">
                    Payout country: {app.payoutCountry}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onApprove(app._id)}
                    className="gap-1"
                  >
                    <Check className="size-4" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingId(app._id)}
                    className="gap-1"
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => loadMore(25)}>
            Load more
          </Button>
        </div>
      )}

      <Dialog
        open={rejectingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingId(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              Optional: leave a note explaining the rejection. The applicant
              will see it in their dashboard.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason (optional)"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectingId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onSubmitReject}
            >
              Reject application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
