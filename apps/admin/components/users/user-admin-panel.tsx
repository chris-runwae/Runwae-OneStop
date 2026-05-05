"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Loader2, ShieldCheck, ShieldOff, UserCog, UserX } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type User = Doc<"users">;

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export function UserAdminPanel({
  user,
  adminCount,
  isSelf,
}: {
  user: User;
  adminCount: number;
  isSelf: boolean;
}) {
  const setSuspension = useMutation(api.admin.users.setSuspension);
  const setAdminStatus = useMutation(api.admin.users.setAdminStatus);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendBusy, setSuspendBusy] = useState(false);

  const [unsuspendOpen, setUnsuspendOpen] = useState(false);
  const [unsuspendBusy, setUnsuspendBusy] = useState(false);

  const [adminToggleOpen, setAdminToggleOpen] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);

  const isSuspended = user.suspendedAt !== undefined;
  const isAdmin = user.isAdmin === true;

  // Last-admin guard preview — disable demote toggle and explain why.
  const wouldBeLastAdmin = isAdmin && adminCount <= 1;
  const remainingAfterDemote = isAdmin ? Math.max(0, adminCount - 1) : adminCount;

  async function handleSuspend() {
    setSuspendBusy(true);
    try {
      await setSuspension({
        userId: user._id,
        suspendedAt: Date.now(),
        suspensionReason: suspendReason.trim() || undefined,
      });
      toast.success("User suspended");
      setSuspendOpen(false);
      setSuspendReason("");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSuspendBusy(false);
    }
  }

  async function handleUnsuspend() {
    setUnsuspendBusy(true);
    try {
      await setSuspension({ userId: user._id, suspendedAt: null });
      toast.success("User unsuspended");
      setUnsuspendOpen(false);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUnsuspendBusy(false);
    }
  }

  async function handleAdminToggle() {
    setAdminBusy(true);
    try {
      await setAdminStatus({ userId: user._id, isAdmin: !isAdmin });
      toast.success(isAdmin ? "Admin revoked" : "Admin granted");
      setAdminToggleOpen(false);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setAdminBusy(false);
    }
  }

  const avatarUrl = user.image ?? user.avatarUrl;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* LEFT — read-only identity */}
      <div className="space-y-6 lg:col-span-2">
        <Section title="Identity" subtitle="Read-only — sourced from auth">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-base font-medium">
                {user.name ?? "Unnamed"}
              </span>
              <span className="text-sm text-muted-foreground">
                {user.email ?? "—"}
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {user.username && (
                  <Badge variant="secondary">@{user.username}</Badge>
                )}
                {isAdmin && <Badge variant="default">Admin</Badge>}
                {isSuspended && <Badge variant="destructive">Suspended</Badge>}
                {user.deletedAt !== undefined && (
                  <Badge variant="outline">Deletion pending</Badge>
                )}
                {user.isAnonymous && <Badge variant="outline">Anonymous</Badge>}
                {isSelf && <Badge variant="outline">You</Badge>}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReadField
              label="Joined"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : new Date(user._creationTime).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
              }
            />
            <ReadField
              label="Email verified"
              value={
                user.emailVerificationTime
                  ? new Date(user.emailVerificationTime).toLocaleString(
                      "en-GB",
                      { dateStyle: "medium", timeStyle: "short" }
                    )
                  : "—"
              }
            />
            <ReadField label="Plan" value={user.plan ?? "free"} />
            <ReadField
              label="Onboarded"
              value={user.onboardingComplete ? "Yes" : "No"}
            />
            <ReadField
              label="Phone"
              value={user.phone ?? "—"}
            />
            <ReadField label="ID" value={user._id} mono />
          </div>
        </Section>

        {isSuspended && user.suspensionReason && (
          <Section title="Suspension reason" subtitle="Internal only — never surfaced to the user">
            <div className="whitespace-pre-wrap rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              {user.suspensionReason}
            </div>
            <p className="text-xs text-muted-foreground">
              Suspended at{" "}
              {user.suspendedAt
                ? new Date(user.suspendedAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </p>
          </Section>
        )}
      </div>

      {/* RIGHT — admin controls */}
      <div className="space-y-6">
        <Section title="Suspension">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">
                {isSuspended ? "Suspended" : "Active"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isSuspended
                  ? "User cannot use the consumer app once enforcement lands."
                  : "User has full access."}
              </div>
            </div>
            {isSelf ? (
              <Button type="button" variant="outline" disabled title="You can't suspend yourself">
                Locked
              </Button>
            ) : isSuspended ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setUnsuspendOpen(true)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Unsuspend
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setSuspendReason("");
                  setSuspendOpen(true);
                }}
              >
                <UserX className="mr-2 h-4 w-4" /> Suspend
              </Button>
            )}
          </div>
        </Section>

        <Section title="Admin status">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">
                {isAdmin ? "Admin" : "Standard user"}
              </div>
              <div className="text-xs text-muted-foreground">
                {adminCount} admin{adminCount === 1 ? "" : "s"} total
              </div>
            </div>
            {isSelf ? (
              <Switch checked={isAdmin} disabled aria-label="Admin status (self-locked)" />
            ) : wouldBeLastAdmin ? (
              <div
                className="inline-flex items-center gap-2"
                title="Cannot demote the last admin. Promote another user first."
              >
                <Switch checked={isAdmin} disabled aria-label="Admin status (last admin)" />
              </div>
            ) : (
              <Switch
                checked={isAdmin}
                onCheckedChange={() => setAdminToggleOpen(true)}
                aria-label="Toggle admin status"
              />
            )}
          </div>
          {isSelf && (
            <p className="text-xs text-muted-foreground">
              You can't change your own admin status. Ask another admin.
            </p>
          )}
          {!isSelf && wouldBeLastAdmin && (
            <p className="text-xs text-muted-foreground">
              <ShieldOff className="mr-1 inline h-3 w-3" />
              This is the last remaining admin. Promote another user before
              demoting.
            </p>
          )}
        </Section>
      </div>

      {/* Suspend confirmation dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend this user?</DialogTitle>
            <DialogDescription>
              You are about to suspend{" "}
              <span className="font-medium text-foreground">
                {user.email ?? user.name ?? user._id}
              </span>
              . The reason is recorded in the audit log and is internal only —
              never shown to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs">Reason (optional)</Label>
            <Textarea
              rows={4}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Spam reports, ToS violation, ops note…"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSuspendOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleSuspend()}
              disabled={suspendBusy}
            >
              {suspendBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserX className="mr-2 h-4 w-4" />
              )}
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsuspend confirmation dialog */}
      <Dialog open={unsuspendOpen} onOpenChange={setUnsuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsuspend this user?</DialogTitle>
            <DialogDescription>
              {user.email ?? user.name ?? user._id} will regain full access. The
              suspension reason will be cleared.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUnsuspendOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleUnsuspend()}
              disabled={unsuspendBusy}
            >
              {unsuspendBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Unsuspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin promote/demote confirmation dialog */}
      <Dialog open={adminToggleOpen} onOpenChange={setAdminToggleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAdmin ? "Revoke admin?" : "Grant admin?"}
            </DialogTitle>
            <DialogDescription>
              {isAdmin ? (
                <>
                  You are about to revoke admin from{" "}
                  <span className="font-medium text-foreground">
                    {user.email ?? user.name ?? user._id}
                  </span>
                  . This will leave {remainingAfterDemote} admin
                  {remainingAfterDemote === 1 ? "" : "s"}.
                </>
              ) : (
                <>
                  You are about to grant admin to{" "}
                  <span className="font-medium text-foreground">
                    {user.email ?? user.name ?? user._id}
                  </span>
                  . They will gain full access to this admin console.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdminToggleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={isAdmin ? "destructive" : "default"}
              onClick={() => void handleAdminToggle()}
              disabled={adminBusy}
            >
              {adminBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isAdmin ? (
                <ShieldOff className="mr-2 h-4 w-4" />
              ) : (
                <UserCog className="mr-2 h-4 w-4" />
              )}
              {isAdmin ? "Revoke admin" : "Grant admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-background p-5">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ReadField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div
        className={
          "flex h-9 items-center rounded-md border border-input bg-muted/30 px-3 text-sm " +
          (mono ? "font-mono text-xs" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
