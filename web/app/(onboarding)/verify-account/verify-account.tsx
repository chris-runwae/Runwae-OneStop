"use client";

import { resendVerification, verifyEmail } from "@/api/onboarding";
import { ROUTES } from "@/app/routes";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { COUNTDOWN_KEY, useCountdown } from "@/hooks/use-countdown";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function VerifyAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  useAuthRedirect(ROUTES.host.overview);

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const timer = useCountdown(COUNTDOWN_KEY, countdownKey);
  const hasMoreTime = timer !== "0:00";

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setIsVerifying(true);
    const { error } = await verifyEmail(email, otp);
    setIsVerifying(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Email verified!");
  };

  const handleResend = async () => {
    if (hasMoreTime || isResending) return;
    setIsResending(true);
    const { error } = await resendVerification(email);
    setIsResending(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Verification code resent");
    setCountdownKey((k) => k + 1);
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
      <div className="w-4/5 flex flex-col items-center">
        <h1 className="text-3xl tracking-tight text-foreground text-center font-bricolage font-medium">
          Verify Account
        </h1>
        <p className="mt-1.5 text-sm text-center mb-20">
          Enter verification code sent to{" "}
          {email ? <strong>{email}</strong> : "your email"}
        </p>

        <InputOTP
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          maxLength={6}
          value={otp}
          onChange={setOtp}
          containerClassName="w-fit"
        >
          <InputOTPGroup className="w-full gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-16 w-16 flex-1 max-w-18 bg-white"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <p className="text-sm mt-5">
          Didn&apos;t get any code?{hasMoreTime ? " Resend in " : " "}
          <button
            type="button"
            onClick={handleResend}
            disabled={hasMoreTime || isResending}
            className="text-primary font-medium disabled:opacity-50"
          >
            {isResending ? "Sending…" : hasMoreTime ? timer : "Resend"}
          </button>
        </p>

        <Button
          type="button"
          size="full"
          className="mt-11 h-11"
          onClick={handleVerify}
          disabled={isVerifying || otp.length < 6}
        >
          {isVerifying ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </div>
  );
}
