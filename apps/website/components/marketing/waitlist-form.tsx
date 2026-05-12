"use client";

import { useState, useTransition } from "react";
import { Button } from "@runwae/ui/components/button";
import { Input } from "@runwae/ui/components/input";

type Status = "idle" | "success" | "error";

export function WaitlistForm({
  source = "homepage",
  className,
}: {
  source?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, hp, source }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "Something went wrong");
        }
        setStatus("success");
        setEmail("");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (status === "success") {
    return (
      <p className={className} role="status">
        Thanks — we&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="waitlist-email">
          Email address
        </label>
        <Input
          id="waitlist-email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sm:flex-1"
        />
        <input
          type="text"
          name="company"
          tabIndex={-1}
          aria-hidden
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Joining…" : "Join the waitlist"}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
