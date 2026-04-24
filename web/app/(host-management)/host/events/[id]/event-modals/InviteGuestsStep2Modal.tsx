"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GuestEmailRow } from "./GuestEmailRow";
import { modalInputClass } from "./ModalField";

interface InviteGuestsStep2ModalProps {
  emails: string[];
  customMessage: string;
  onCustomMessageChange: (v: string) => void;
  onBack: () => void;
  onSendInvites: () => void;
}

export function InviteGuestsStep2Modal({
  emails,
  customMessage,
  onCustomMessageChange,
  onBack,
  onSendInvites,
}: InviteGuestsStep2ModalProps) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-body">Guests</p>
          <div className="mt-2 space-y-2">
            {emails.map((email) => (
              <GuestEmailRow key={email} email={email} />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-body">Custom Message</label>
          <textarea
            placeholder="Add a custom message here..."
            value={customMessage}
            onChange={(e) => onCustomMessageChange(e.target.value)}
            rows={4}
            className={cn(
              modalInputClass,
              "mt-1 min-h-[100px] resize-none py-2"
            )}
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" className="flex-1" onClick={onSendInvites}>
          Send Invites
        </Button>
      </div>
    </>
  );
}
