import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DestinationForm } from "@/components/destinations/destination-form";

export const metadata = { title: "New destination" };

export default function NewDestinationPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <Link
          href="/destinations"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back to destinations
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          New destination
        </h1>
      </div>
      <DestinationForm mode="create" />
    </div>
  );
}
