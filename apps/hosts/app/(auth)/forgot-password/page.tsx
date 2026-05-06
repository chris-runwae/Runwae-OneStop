"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@runwae/ui/components/button";
import { Input } from "@runwae/ui/components/input";
import { Label } from "@runwae/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";

type Step = "request" | "reset";

export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", { email, flow: "reset" });
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset.");
    } finally {
      setSubmitting(false);
    }
  }

  async function applyReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", {
        email,
        code,
        newPassword,
        flow: "reset-verification",
      });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">
            {step === "request" ? "Reset password" : "Set a new password"}
          </CardTitle>
          <CardDescription>
            {step === "request"
              ? "Enter your account email — we'll send a code."
              : `Enter the 8-digit code we sent to ${email}.`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "request" ? (
            <form className="space-y-3" onSubmit={requestReset}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset code"}
              </Button>
              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-center text-xs text-destructive">
                  {error}
                </p>
              )}
            </form>
          ) : (
            <form className="space-y-3" onSubmit={applyReset}>
              <div className="space-y-1.5">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  required
                  inputMode="numeric"
                  pattern="\d{8}"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating…" : "Update password"}
              </Button>
              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-center text-xs text-destructive">
                  {error}
                </p>
              )}
            </form>
          )}
        </CardContent>

        <CardFooter className="text-center text-xs text-muted-foreground">
          <p className="w-full">
            <Link href="/sign-in" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
