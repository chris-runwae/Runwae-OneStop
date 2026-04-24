"use client";

import { updatePassword } from "@/api/onboarding";
import { ROUTES } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const error = params.get("error");
    if (error) {
      const description =
        params.get("error_description")?.replace(/\+/g, " ") ??
        "This link is invalid or has expired.";
      setLinkError(description);
    }
  }, []);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    console.log("what's wrong here");
    const { error } = await updatePassword(password);
    setIsLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Password updated successfully");
    router.push(ROUTES.login);
  };

  if (linkError) {
    return (
      <div className="mx-auto w-full text-muted-foreground">
        <div className="w-4/5 flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl tracking-tight text-foreground font-bricolage font-medium">
            Link Expired
          </h1>
          <p className="text-sm">{linkError}</p>
          <Button
            type="button"
            size="full"
            className="mt-4 h-11"
            onClick={() => router.push(ROUTES.forgotPassword)}
          >
            Request a new link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full text-muted-foreground">
      <div className="w-4/5">
        <h1 className="text-2xl tracking-tight text-foreground text-center font-bricolage font-medium">
          Reset Password
        </h1>

        <form className="space-y-4 mt-12" onSubmit={handleSubmit}>
          <InputField
            icon={<Lock className="size-4" />}
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputField
            icon={<Lock className="size-4" />}
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            size="full"
            className="mt-12 h-11"
            disabled={isLoading}
          >
            {isLoading ? "Updating…" : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
