"use client";

import { ROUTES } from "@/app/routes";
import { SocialAuthButton } from "@/components/auth/social-auth-button";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Lock, User } from "lucide-react";
import Link from "next/link";

export default function Login() {
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

      <form className="space-y-4">
        <InputField
          icon={<User className="size-4" />}
          placeholder="Username"
          name="username"
        />

        <InputField
          icon={<Lock className="size-4" />}
          type="password"
          placeholder="Password"
          name="password"
        />

        <Link href={ROUTES.forgotPassword} className="text-sm text-primary">
          Forgot password?
        </Link>

        <Button type="submit" size="full" className="mt-12 h-11">
          Login
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
// we don't use emails in the signup screen
