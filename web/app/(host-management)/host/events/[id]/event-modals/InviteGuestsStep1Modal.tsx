"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { useState } from "react";
import { GuestEmailRow } from "./GuestEmailRow";
import { modalInputClass } from "./ModalField";

interface InviteGuestsStep1ModalProps {
  inviteLink: string;
  emails: string[];
  onAddEmail: (email: string) => void;
  onRemoveEmail: (email: string) => void;
  onNext: () => void;
}

export function InviteGuestsStep1Modal({
  inviteLink,
  emails,
  onAddEmail,
  onRemoveEmail,
  onNext,
}: InviteGuestsStep1ModalProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAddEmail(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-body">Invite Link</label>
        <div className="mt-1 flex gap-2">
          <Input
            readOnly
            value={inviteLink}
            className={cn(modalInputClass, "flex-1")}
          />
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => navigator.clipboard.writeText(inviteLink)}
          >
            <Copy className="size-4" />
          </Button>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-body">Add Emails</p>
        <div className="mt-1 flex gap-2">
          <Input
            type="email"
            placeholder="Enter Email..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(modalInputClass, "flex-1")}
          />
          <Button type="button" variant="outline" size="default" onClick={handleAdd}>
            Add
          </Button>
        </div>
      </div>
      {emails.length > 0 && (
        <div className="flex flex-col gap-2">
          {emails.map((email) => (
            <GuestEmailRow
              key={email}
              email={email}
              showCheck
              onRemove={() => onRemoveEmail(email)}
            />
          ))}
        </div>
      )}
      <Button
        variant="primary"
        className="mt-2 w-full"
        onClick={onNext}
        disabled={emails.length === 0}
      >
        Next
      </Button>
    </div>
  );
}
