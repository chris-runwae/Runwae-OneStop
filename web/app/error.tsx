"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-page p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-error-light">
          <AlertCircleIcon className="size-8 text-error" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl">
            Something went wrong
          </h1>
          <p className="max-w-md text-body">
            We encountered an unexpected error. Please try again or return to
            the dashboard.
          </p>
          {error.message && (
            <p className="max-w-md text-sm text-muted-foreground">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button onClick={reset} variant="primary" size="lg">
            Try again
          </Button>
          <Link
            href="/overview"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "inline-flex items-center gap-2 no-underline"
            )}
          >
            <HomeIcon className="size-4" aria-hidden />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
