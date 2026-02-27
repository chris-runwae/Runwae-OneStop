"use client";

import { Button } from "@/components/ui/button";
import { AccessControl } from "./AccessControl";
import { ShowOnEventPageToggle } from "./ShowOnEventPageToggle";
import type { HostInfo } from "./types";

interface UpdateHostModalProps {
  host: HostInfo | null;
  showOnPage: boolean;
  onShowOnPageChange: (v: boolean) => void;
  isManager: boolean;
  onIsManagerChange: (v: boolean) => void;
  onUpdate: () => void;
  onRemove: () => void;
}

export function UpdateHostModal({
  host,
  showOnPage,
  onShowOnPageChange,
  isManager,
  onIsManagerChange,
  onUpdate,
  onRemove,
}: UpdateHostModalProps) {
  if (!host) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-medium text-body">{host.name}</p>
        <p className="text-sm text-muted-foreground">{host.email}</p>
      </div>
      <ShowOnEventPageToggle checked={showOnPage} onChange={onShowOnPageChange} />
      <AccessControl isManager={isManager} onSelect={onIsManagerChange} />
      <div className="flex gap-3">
        <Button variant="primary" className="flex-1" onClick={onUpdate}>
          Update
        </Button>
        <Button variant="outline" className="flex-1" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
