"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AccessControl } from "./AccessControl";
import { ShowOnEventPageToggle } from "./ShowOnEventPageToggle";

interface ConfigureHostModalProps {
  showOnPage: boolean;
  onShowOnPageChange: (v: boolean) => void;
  isManager: boolean;
  onIsManagerChange: (v: boolean) => void;
  onSendInvite: () => void | Promise<void>;
}

export function ConfigureHostModal({
  showOnPage,
  onShowOnPageChange,
  isManager,
  onIsManagerChange,
  onSendInvite,
}: ConfigureHostModalProps) {
  const [busy, setBusy] = useState(false);

  const handleSend = async () => {
    setBusy(true);
    try {
      await onSendInvite();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ShowOnEventPageToggle
        checked={showOnPage}
        onChange={onShowOnPageChange}
      />
      <AccessControl isManager={isManager} onSelect={onIsManagerChange} />
      <Button
        variant="primary"
        className="w-full"
        disabled={busy}
        onClick={() => void handleSend()}
      >
        Send Invite
      </Button>
    </div>
  );
}
