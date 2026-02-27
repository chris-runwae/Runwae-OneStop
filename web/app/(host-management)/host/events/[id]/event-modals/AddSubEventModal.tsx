"use client";

import { Button } from "@/components/ui/button";
import { ModalField } from "./ModalField";
import { useState } from "react";

interface AddSubEventModalProps {
  onNext: (name: string, dateTime: string) => void;
  onClose: () => void;
}

export function AddSubEventModal({ onNext, onClose }: AddSubEventModalProps) {
  const [name, setName] = useState("");
  const [dateTime, setDateTime] = useState("");

  const handleSubmit = () => {
    onNext(name, dateTime);
    setName("");
    setDateTime("");
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <ModalField
        label="Sub-Event Name"
        placeholder="Event Name"
        value={name}
        onChange={setName}
      />
      <ModalField
        label="Date & Time"
        type="datetime-local"
        value={dateTime}
        onChange={setDateTime}
      />
      <Button variant="primary" className="mt-2 w-full" onClick={handleSubmit}>
        Next
      </Button>
    </div>
  );
}
