"use client";

import { signIn } from "@/api/onboarding";
import { ROUTES } from "@/app/routes";
import { SocialAuthButton } from "@/components/auth/social-auth-button";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useAuthRedirect(ROUTES.host.overview);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast.error(error);
    }
  };

  return (
    <div className="mx-auto w-full text-muted-foreground">
      <h1 className="text-2xl tracking-tight text-foreground text-center font-bricolage font-medium">
        Login
      </h1>

      <div className="mt-12 space-y-3">
        <SocialAuthButton provider="google">
          Continue with Google
        </SocialAuthButton>
        <SocialAuthButton provider="apple">
          Continue with Apple
        </SocialAuthButton>
      </div>

      <div className="relative my-6 flex items-center">
        <div className="flex-1 border-t border-input" />
        <span className="mx-3 text-xs tracking-wide text-muted-foreground">
          or
        </span>
        <div className="flex-1 border-t border-input" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          icon={<Mail className="size-4" />}
          type="email"
          placeholder="Email address"
          name="email"
          required
        />

        <InputField
          icon={<Lock className="size-4" />}
          type="password"
          placeholder="Password"
          name="password"
          required
        />

        <Link href={ROUTES.forgotPassword} className="text-sm text-primary">
          Forgot password?
        </Link>

        <Button
          type="submit"
          size="full"
          className="mt-12 h-11"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Don't have an account yet?{" "}
        <Link
          href={ROUTES.signup}
          className="font-medium text-[#e91e8c] hover:underline"
        >
          Signup here
        </Link>
      </p>
    </div>
  );
}
// LOGS
// username field is email address
