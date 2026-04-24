"use client";

import { Button } from "@/components/ui/button";
import { ModalField } from "./ModalField";
import { useState } from "react";

interface AddHostModalProps {
  onNext: (name: string, email: string) => void;
}

export function AddHostModal({ onNext }: AddHostModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) return;
    onNext(trimmedName, trimmedEmail);
    setName("");
    setEmail("");
  };

  return (
    <div className="flex flex-col gap-4">
      <ModalField
        label="Full Name"
        placeholder="Full Name"
        value={name}
        onChange={setName}
      />
      <ModalField
        label="Email Address"
        type="email"
        placeholder="Enter Email Address"
        value={email}
        onChange={setEmail}
      />
      <Button variant="primary" className="mt-2 w-full" onClick={handleSubmit}>
        Next
      </Button>
    </div>
  );
}
