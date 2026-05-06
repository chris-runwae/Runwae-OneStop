"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { ChevronLeft, Send } from "lucide-react";
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
import { Textarea } from "@runwae/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@runwae/ui/components/select";

const STATUSES: Doc<"support_tickets">["status"][] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

const PRIORITIES: Doc<"support_tickets">["priority"][] = [
  "low",
  "normal",
  "high",
  "urgent",
];

export default function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ticketId = id as Id<"support_tickets">;
  const data = useQuery(api.admin.support.getTicket, { ticketId });

  const setStatus = useMutation(api.admin.support.setStatus);
  const setPriority = useMutation(api.admin.support.setPriority);
  const reply = useMutation(api.admin.support.replyToTicket);

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const onSendReply = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await reply({ ticketId, body });
      setBody("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Link
        href="/support"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-heading"
      >
        <ChevronLeft className="size-4" />
        All tickets
      </Link>

      {data === undefined ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : data === null ? (
        <p className="text-sm text-muted-foreground">Ticket not found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
                {data.ticket.subject}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Opened by{" "}
                {data.reporter?.name ?? data.reporter?.email ?? "unknown"} on{" "}
                {new Date(data.ticket.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              {data.messages.map((msg) => (
                <Card
                  key={msg._id}
                  className={
                    msg.authorRole === "admin"
                      ? "border-primary/40 bg-primary/5"
                      : ""
                  }
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium uppercase tracking-wide">
                        {msg.authorRole}
                      </span>
                      <span>
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-body">
                      {msg.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a reply…"
                  className="min-h-[120px]"
                  disabled={data.ticket.status === "closed"}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={onSendReply}
                    disabled={
                      sending ||
                      !body.trim() ||
                      data.ticket.status === "closed"
                    }
                    className="gap-1"
                  >
                    <Send className="size-4" />
                    Send reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <Field label="Status">
                  <Select
                    value={data.ticket.status}
                    onValueChange={async (value) => {
                      try {
                        await setStatus({
                          ticketId,
                          status: value as Doc<"support_tickets">["status"],
                        });
                      } catch (e) {
                        toast.error(
                          e instanceof Error ? e.message : "Failed"
                        );
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Priority">
                  <Select
                    value={data.ticket.priority}
                    onValueChange={async (value) => {
                      try {
                        await setPriority({
                          ticketId,
                          priority: value as Doc<"support_tickets">["priority"],
                        });
                      } catch (e) {
                        toast.error(
                          e instanceof Error ? e.message : "Failed"
                        );
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Category">
                  <Badge variant="outline" className="capitalize">
                    {data.ticket.category}
                  </Badge>
                </Field>
                <Field label="Assignee">
                  <span className="text-muted-foreground">
                    {data.assignee?.name ?? data.assignee?.email ?? "—"}
                  </span>
                </Field>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
