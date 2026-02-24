"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { COUNTDOWN_KEY, useCountdown } from "@/hooks/use-countdown";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyAccount() {
  const [countdownKey, setCountdownKey] = useState(0);
  const [otp, setOtp] = useState("");
  const timer = useCountdown(COUNTDOWN_KEY, countdownKey);
  const router = useRouter();
  const hasMoreTime = timer !== "0:00";

  const handleResend = () => {
    if (hasMoreTime) return;
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
          Enter verification code sent to your email
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
          Didn’t get any code?
          {hasMoreTime ? " Resend in " : ""}
          <span className="text-primary font-medium">
            {hasMoreTime ? timer : "Resend"}
          </span>
        </p>

        <Button type="button" size="full" className="mt-11 h-11">
          Verify
        </Button>
      </div>
    </div>
  );
}

// LOGS
// we don't use emails in the signup screen
