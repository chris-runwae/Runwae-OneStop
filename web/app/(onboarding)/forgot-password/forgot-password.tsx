"use client";

import { ROUTES } from "@/app/routes";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { ArrowLeft, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendCode = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Password reset email sent — check your inbox");
    router.push(ROUTES.confirmOtp);
  };

  return (
    <div className="mx-auto w-full text-muted-foreground">
      <button
        className="flex items-center gap-2 mbe-28"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </button>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl tracking-tight text-foreground text-center font-bricolage font-medium">
          Forgot Password
        </h1>
        <p className="mt-1.5 mb-6 text-sm text-center">
          Enter your email to receive a code to reset your password.
        </p>

        <InputField
          icon={<Mail className="size-4" />}
          placeholder="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          type="submit"
          size="full"
          className="mt-8 h-11"
          onClick={sendCode}
          disabled={isLoading}
        >
          {isLoading ? "Sending…" : "Send Code"}
        </Button>
      </div>
    </div>
  );
}
