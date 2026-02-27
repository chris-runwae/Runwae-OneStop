"use client";

import { Button } from "@/components/ui/button";
import { AccessControl } from "./AccessControl";
import { ShowOnEventPageToggle } from "./ShowOnEventPageToggle";

interface ConfigureHostModalProps {
  showOnPage: boolean;
  onShowOnPageChange: (v: boolean) => void;
  isManager: boolean;
  onIsManagerChange: (v: boolean) => void;
  onSendInvite: () => void;
}

export function ConfigureHostModal({
  showOnPage,
  onShowOnPageChange,
  isManager,
  onIsManagerChange,
  onSendInvite,
}: ConfigureHostModalProps) {
  return (
    <div className="flex flex-col gap-6">
      <ShowOnEventPageToggle checked={showOnPage} onChange={onShowOnPageChange} />
      <AccessControl isManager={isManager} onSelect={onIsManagerChange} />
      <Button variant="primary" className="w-full" onClick={onSendInvite}>
        Send Invite
      </Button>
    </div>
  );
}
