"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Landmark } from "lucide-react";
import { useState } from "react";

type PaymentMethod = "bank" | "stripe" | null;

const PaymentSetup = () => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Header: Title left, step indicator right */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-bricolage">
            Payment Setup
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Connect Bank Account or Stripe Account
          </p>
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">1 of 2</span>
      </div>

      {/* Select Payment method */}
      <p className="mt-8 text-sm font-medium text-foreground">
        Select Payment method
      </p>

      {/* Payment option cards */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setSelectedMethod("bank")}
          className={cn(
            "flex flex-col items-center rounded-xl border bg-white px-6 py-8 text-center shadow-sm transition-colors",
            "hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selectedMethod === "bank" && "ring-2 ring-primary border-primary"
          )}
        >
          <Landmark className="size-10 text-[#e91e8c] mb-4" />
          <span className="text-base font-semibold text-foreground">
            Bank Account
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            Link your Bank account
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMethod("stripe")}
          className={cn(
            "flex flex-col items-center rounded-xl border bg-white px-6 py-8 text-center shadow-sm transition-colors",
            "hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selectedMethod === "stripe" && "ring-2 ring-primary border-primary"
          )}
        >
          <span className="mb-4 text-2xl font-semibold tracking-tight text-[#635BFF]">
            stripe
          </span>
          <span className="text-base font-semibold text-foreground">
            Stripe
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            Link your Stripe account
          </span>
        </button>
      </div>

      {/* Action buttons */}
      <div className="mt-10 flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="full"
          className="h-11 flex-1 rounded-lg border-0 bg-zinc-100 text-foreground hover:bg-zinc-200"
        >
          Skip
        </Button>
        <Button type="button" size="full" className="h-11 flex-1 rounded-lg">
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaymentSetup;
