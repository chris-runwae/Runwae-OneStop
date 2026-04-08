"use client";

import { ROUTES } from "@/app/routes";
import { SocialAuthButton } from "@/components/auth/social-auth-button";
import { PhoneInput } from "@/components/shared/phone-input";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/context/AuthContext";
import { Building2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SignUp() {
  const { signUp, signIn, resendVerification } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;
    const email = form.get("email") as string;
    const organisation = form.get("organisation") as string;
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;
    const terms = form.get("terms");

    if (!terms) {
      toast.error("Please accept the Terms & Conditions to continue.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const { error } = await signUp({
      email,
      password,
      firstName,
      lastName,
      organisation,
      phone,
    });
    setIsLoading(false);

    if (error) {
      if (error.includes("already registered") || error.includes("already exists")) {
        // Try signing them in to determine their verification state
        const { error: signInError } = await signIn(email, password);

        if (!signInError) {
          toast.warning("You already have an account. Welcome back!");
          router.push(ROUTES.host.overview);
          return;
        }

        if (signInError.toLowerCase().includes("not confirmed") || signInError.toLowerCase().includes("email not confirmed")) {
          toast.warning("Account exists but isn't verified. Sending a new code…");
          await resendVerification(email);
          router.push(`${ROUTES.verifyAccount}?email=${encodeURIComponent(email)}`);
          return;
        }

        toast.warning("You already have an account. Please log in.");
        router.push(ROUTES.login);
        return;
      }

      toast.error(error);
      return;
    }

    toast.success("Account created! Check your email to verify your account.");
    router.push(`${ROUTES.verifyAccount}?email=${encodeURIComponent(email)}`);
  };

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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            icon={<User className="size-4" />}
            placeholder="First Name"
            name="firstName"
            required
          />
          <InputField
            icon={<User className="size-4" />}
            placeholder="Last name"
            name="lastName"
            required
          />
        </div>

        <InputField
          icon={<Mail className="size-4" />}
          type="email"
          placeholder="Email address"
          name="email"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            icon={<Building2 className="size-4" />}
            placeholder="Organisation Name"
            name="organisation"
          />
          <PhoneInput value={phone} onChange={setPhone} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            icon={<Lock className="size-4" />}
            type="password"
            placeholder="Password"
            name="password"
            required
          />
          <InputField
            icon={<Lock className="size-4" />}
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            required
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

        <Button
          type="submit"
          size="full"
          className="mt-8 h-11"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium text-[#e91e8c] hover:underline"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}
