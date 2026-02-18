import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileQuestionIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-page p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <FileQuestionIcon className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl">
            Page not found
          </h1>
          <p className="max-w-md text-body">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          href="/overview"
          className={cn(
            buttonVariants({ variant: "primary", size: "lg" }),
            "inline-flex items-center gap-2 no-underline"
          )}
        >
          <HomeIcon className="size-4" aria-hidden />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
