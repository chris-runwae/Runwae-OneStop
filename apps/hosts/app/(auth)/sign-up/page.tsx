"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
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

type Step = "form" | "verify";

export default function HostSignUpPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/onboarding/profile-setup");
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", {
        email,
        password,
        name,
        flow: "signUp",
      });
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", {
        email,
        code,
        flow: "email-verification",
      });
      router.replace("/onboarding/profile-setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">
            {step === "form" ? "Apply to host" : "Verify your email"}
          </CardTitle>
          <CardDescription>
            {step === "form"
              ? "Create your account, then submit your host application."
              : `We sent an 8-digit code to ${email}.`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "form" ? (
            <form className="space-y-3" onSubmit={handleSubmitForm}>
              <div className="space-y-1.5">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={submitting}
              >
                {submitting ? "Creating account…" : "Continue"}
              </Button>
              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-center text-xs text-destructive">
                  {error}
                </p>
              )}
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleVerify}>
              <div className="space-y-1.5">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  required
                  pattern="\d{8}"
                  maxLength={8}
                  placeholder="12345678"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Verifying…" : "Verify and continue"}
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
            Already a host?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
