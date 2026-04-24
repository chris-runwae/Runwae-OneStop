"use client";

import { cn } from "@/lib/utils";

interface AccessControlProps {
  isManager: boolean;
  onSelect: (isManager: boolean) => void;
}

export function AccessControl({ isManager, onSelect }: AccessControlProps) {
  return (
    <div>
      <p className="text-sm font-medium text-body">Access Control</p>
      <div className="mt-2 space-y-2">
        <button
          type="button"
          onClick={() => onSelect(true)}
          className={cn(
            "flex w-full flex-col rounded-lg border p-3 text-left transition-colors",
            isManager ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          <span className="font-medium text-body">Manager</span>
          <span className="text-sm text-muted-foreground">
            Full manage access to the event.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelect(false)}
          className={cn(
            "flex w-full flex-col rounded-lg border p-3 text-left transition-colors",
            !isManager ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          <span className="font-medium text-body">Non-Manager</span>
          <span className="text-sm text-muted-foreground">
            No manage event access.
          </span>
        </button>
      </div>
    </div>
  );
}
