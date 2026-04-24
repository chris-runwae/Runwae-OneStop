"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AccessControl } from "./AccessControl";
import { ShowOnEventPageToggle } from "./ShowOnEventPageToggle";
import type { HostInfo } from "./types";

interface UpdateHostModalProps {
  host: HostInfo | null;
  showOnPage: boolean;
  onShowOnPageChange: (v: boolean) => void;
  isManager: boolean;
  onIsManagerChange: (v: boolean) => void;
  onUpdate: () => void | Promise<void>;
  onRemove: () => void | Promise<void>;
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
  const [busy, setBusy] = useState<"update" | "remove" | null>(null);

  if (!host) return null;

  const run = async (
    action: "update" | "remove",
    fn: () => void | Promise<void>,
  ) => {
    setBusy(action);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-medium text-body">{host.name}</p>
        <p className="text-sm text-muted-foreground">{host.email}</p>
      </div>
      <ShowOnEventPageToggle checked={showOnPage} onChange={onShowOnPageChange} />
      <AccessControl isManager={isManager} onSelect={onIsManagerChange} />
      <div className="flex gap-3">
        <Button
          variant="primary"
          className="flex-1"
          disabled={busy !== null}
          onClick={() => void run("update", onUpdate)}
        >
          Update
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={busy !== null}
          onClick={() => void run("remove", onRemove)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
