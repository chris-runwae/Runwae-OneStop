"use client";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  return (
    <div className="mx-auto w-full text-muted-foreground">
      <div className="w-4/5">
        <h1 className="text-2xl tracking-tight text-foreground text-center font-bricolage font-medium">
          Reset Password
        </h1>

        <form className="space-y-4 mt-12">
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

          <Button type="submit" size="full" className="mt-12 h-11">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

// LOGS
// we don't use emails in the signup screen
