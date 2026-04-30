"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Ticket, type TicketStatus } from "./ticket-types";

const STATUS_TABS: (TicketStatus | "All")[] = ["All", "Open", "Pending", "Closed", "Resolved"];

const STATUS_STYLES: Record<TicketStatus, string> = {
  Open: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Closed: "bg-gray-100 text-gray-500",
  Resolved: "bg-sky-50 text-sky-700",
};

const PRIORITY_STYLES = {
  High: "text-rose-500",
  Medium: "text-amber-600",
  Low: "text-muted-foreground",
};

type ActionType = "refund" | "cancel" | "payout" | "suspend" | "escalate";

type Props = {
  onOpenTicket: (t: Ticket) => void;
  onAction: (type: ActionType, ticket: Ticket) => void;
};

export function TicketsTable({ onOpenTicket, onAction }: Props) {
  const [activeTab, setActiveTab] = useState<TicketStatus | "All">("All");
  const tickets: Ticket[] = [];
  const filtered = activeTab === "All" ? tickets : tickets.filter((t) => t.status === activeTab);

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border bg-surface overflow-hidden">
      {/* Status Tabs */}
      <div className="flex items-center gap-0 border-b border-border overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 border-b-2 px-5 py-3.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-body",
            )}
          >
            {tab}
            {tab !== "All" && (
              <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-2.5", activeTab === tab ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                0
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-180">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Ticket ID", "User", "Subject", "Category", "Priority", "Status", "Last Updated", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                  No support tickets yet.
                </td>
              </tr>
            ) : filtered.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => onOpenTicket(ticket)}
                    className="text-xs font-mono font-medium text-primary hover:underline"
                  >
                    {ticket.id}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-black">{ticket.userName}</p>
                    <p className="text-xs text-muted-foreground">{ticket.userEmail}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-body max-w-48 truncate">{ticket.subject}</td>
                <td className="px-5 py-3 text-sm text-body">{ticket.category}</td>
                <td className="px-5 py-3">
                  <span className={cn("text-xs font-semibold", PRIORITY_STYLES[ticket.priority])}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[ticket.status])}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{ticket.lastUpdated}</td>
                <td className="px-5 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-black transition-colors"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem className="cursor-pointer text-sm" onSelect={() => onOpenTicket(ticket)}>
                        Ticket Information
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-sm" onSelect={() => onAction("refund", ticket)}>
                        Issue a Refund
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-sm" onSelect={() => onAction("cancel", ticket)}>
                        Cancel Booking
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-sm" onSelect={() => onAction("payout", ticket)}>
                        Adjust Vendor Payout
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-sm" onSelect={() => onAction("suspend", ticket)}>
                        Suspend Account
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-sm" onSelect={() => onAction("escalate", ticket)}>
                        Escalate to Engineering
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
