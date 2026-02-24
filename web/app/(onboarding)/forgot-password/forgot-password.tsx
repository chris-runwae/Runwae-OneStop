"use client";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { ArrowLeft, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const sendCode = () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    console.log("Sending code");
    router.push("/confirm-otp");
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          type="submit"
          size="full"
          className="mt-8 h-11"
          onClick={sendCode}
        >
          Send Code
        </Button>
      </div>
    </div>
  );
}

// LOGS
// we don't use emails in the signup screen
