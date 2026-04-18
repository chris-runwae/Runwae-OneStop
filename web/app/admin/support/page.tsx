"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TicketsTable } from "./components/tickets-table";
import { TicketThread } from "./components/ticket-thread";
import {
  CreateTicketModal,
  IssueRefundModal,
  CancelBookingModal,
  AdjustPayoutModal,
  SuspendAccountModal,
  EscalateModal,
} from "./components/action-modals";
import type { Ticket } from "./components/ticket-types";

type ModalType = "none" | "create" | "refund" | "cancel" | "payout" | "suspend" | "escalate";

export default function AdminSupportPage() {
  const [openTicket, setOpenTicket] = useState<Ticket | null>(null);
  const [modal, setModal] = useState<ModalType>("none");

  return (
    <>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-black">Support Tickets</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage support requests and resolve issues.</p>
          </div>
          <button
            type="button"
            onClick={() => setModal("create")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> New Ticket
          </button>
        </div>

        <TicketsTable
          onOpenTicket={setOpenTicket}
          onAction={(type, _ticket) => setModal(type as ModalType)}
        />
      </div>

      {/* Ticket thread panel */}
      <TicketThread ticket={openTicket} onClose={() => setOpenTicket(null)} />

      {/* Action modals */}
      <CreateTicketModal open={modal === "create"} onClose={() => setModal("none")} />
      <IssueRefundModal open={modal === "refund"} onClose={() => setModal("none")} />
      <CancelBookingModal open={modal === "cancel"} onClose={() => setModal("none")} />
      <AdjustPayoutModal open={modal === "payout"} onClose={() => setModal("none")} />
      <SuspendAccountModal open={modal === "suspend"} onClose={() => setModal("none")} />
      <EscalateModal open={modal === "escalate"} onClose={() => setModal("none")} />
    </>
  );
}
