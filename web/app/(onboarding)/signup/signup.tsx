"use client";

import { SocialAuthButton } from "@/components/auth/social-auth-button";
import { PhoneInput } from "@/components/shared/phone-input";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Building2, Lock, User } from "lucide-react";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="mx-auto w-full text-muted-foreground">
      <img
        src="/logo-dark.png"
        alt="Runwae Logo"
        className="lg:w-7 lg:h-10 w-5 h-7 mx-auto my-4 "
      />
      <h1 className="text-2xl tracking-tight text-foreground text-center font-bricolage font-medium">
        Create an Account
      </h1>
      <p className="mt-1.5 text-sm text-center">
        Sign up with your email and a password.
      </p>

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
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            icon={<User className="size-4" />}
            placeholder="First Name"
            name="firstName"
          />
          <InputField
            icon={<User className="size-4" />}
            placeholder="Last name"
            name="lastName"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            icon={<Building2 className="size-4" />}
            placeholder="Organisation Name"
            name="organisation"
          />
          <PhoneInput />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            icon={<Lock className="size-4" />}
            type="password"
            placeholder="Password"
            name="password"
          />
          <InputField
            icon={<Lock className="size-4" />}
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 pt-1">
          <input
            type="checkbox"
            name="terms"
            className="mt-1 size-4 rounded border-input"
          />
          <span className="text-sm text-muted-foreground">
            I agree to Terms & Conditions of Runwae
          </span>
        </label>

        <Button type="submit" size="full" className="mt-8 h-11">
          Create Account
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#e91e8c] hover:underline"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}
