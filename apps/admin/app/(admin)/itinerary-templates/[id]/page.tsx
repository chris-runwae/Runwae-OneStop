"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TemplateForm } from "@/components/itinerary-templates/template-form";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const templateId = id as Id<"itinerary_templates">;
  const template = useQuery(api.admin.itinerary_templates.getById, {
    id: templateId,
  });

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
          {template ? template.title : "Loading…"}
        </h1>
      </div>
      {template === undefined ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : template === null ? (
        <div className="rounded-md border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Template not found.
        </div>
      ) : (
        <TemplateForm mode="edit" initial={template} />
      )}
    </div>
  );
}
