"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { COUNTDOWN_KEY, useCountdown } from "@/hooks/use-countdown";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useState } from "react";

export default function ConfirmOTP() {
  const [countdownKey, setCountdownKey] = useState(0);
  const [otp, setOtp] = useState("");
  const timer = useCountdown(COUNTDOWN_KEY, countdownKey);

  const hasMoreTime = timer !== "0:00";

  const handleResend = () => {
    if (hasMoreTime) return;
    setCountdownKey((k) => k + 1);
  };

  return (
    <div className="mx-auto w-full text-muted-foreground">
      <div className="w-4/5">
        <h1 className="text-2xl tracking-tight text-foreground text-center font-bricolage font-medium">
          Confirm OTP
        </h1>
        <p className="mt-1.5 text-sm text-center">
          Enter the verification code sent to your email
        </p>

        <InputOTP
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          maxLength={6}
          value={otp}
          onChange={setOtp}
          containerClassName="mt-12 w-full"
        >
          <InputOTPGroup className="w-full gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-16 w-auto flex-1 max-w-18 bg-white"
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
          Confirm
        </Button>
      </div>
    </div>
  );
}

// LOGS
// we don't use emails in the signup screen
