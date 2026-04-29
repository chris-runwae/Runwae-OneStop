import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TemplateForm } from "@/components/itinerary-templates/template-form";

export const metadata = { title: "New itinerary template" };

export default function NewTemplatePage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <Link
          href="/itinerary-templates"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back to templates
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          New itinerary template
        </h1>
      </div>
      <TemplateForm mode="create" />
    </div>
  );
}
