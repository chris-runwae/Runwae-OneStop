import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function EventManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <Link
        href="/events"
        className={cn(
          buttonVariants({ variant: "outline", size: "default" }),
          "w-fit"
        )}
      >
        ← Back to Events
      </Link>
      <h1 className="font-display text-2xl font-bold text-black">
        Event Management
      </h1>
      <p className="text-muted-foreground">
        Event management page coming soon.
      </p>
    </div>
  );
}
