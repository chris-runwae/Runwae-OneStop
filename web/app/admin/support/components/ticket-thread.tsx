"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ticket } from "./ticket-types";

const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Closed: "bg-gray-100 text-gray-500",
  Resolved: "bg-sky-50 text-sky-700",
};

type Props = {
  ticket: Ticket | null;
  onClose: () => void;
};

export function TicketThread({ ticket, onClose }: Props) {
  const [reply, setReply] = useState("");

  if (!ticket) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{ticket.id}</p>
            <h2 className="mt-0.5 font-display text-base font-bold text-black">{ticket.subject}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-2.5 font-semibold", STATUS_STYLES[ticket.status])}>
                {ticket.status}
              </span>
              <span className="text-xs text-muted-foreground">{ticket.category}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{ticket.createdAt}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-muted-foreground hover:text-black transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b border-border px-5 py-3 bg-muted/20">
          <p className="text-xs font-medium text-black">{ticket.userName}</p>
          <p className="text-xs text-muted-foreground">{ticket.userEmail}</p>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-1", msg.sender === "admin" ? "items-end" : "items-start")}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-2.5 font-bold",
                    msg.sender === "admin"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {msg.senderName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <span className="text-xs font-medium text-black">{msg.senderName}</span>
              </div>

              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                  msg.sender === "admin"
                    ? "bg-primary/10 text-black"
                    : "bg-muted/60 text-body",
                )}
              >
                {msg.body}
              </div>
              <span className="text-2.5 text-muted-foreground">{msg.timestamp}</span>
            </div>
          ))}
        </div>

        {/* Reply input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a reply…"
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm text-body placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              disabled={!reply.trim()}
              className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
