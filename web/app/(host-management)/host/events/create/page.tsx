import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import CreateEvent from "./create-event";

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <Spinner className="size-8 text-primary" />
        </div>
      }
    >
      <CreateEvent />
    </Suspense>
  );
}
