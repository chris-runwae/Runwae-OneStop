"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CollectionEditor } from "@/components/collections/collection-editor";

export default function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const collectionId = id as Id<"collections">;
  const collection = useQuery(api.admin.collections.getById, {
    id: collectionId,
  });

  return (
    <div className="space-y-6 p-8">
      <div>
        <Link
          href="/collections"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back to collections
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {collection ? collection.title : "Loading…"}
        </h1>
      </div>
      {collection === undefined ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : collection === null ? (
        <div className="rounded-md border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Collection not found.
        </div>
      ) : (
        <CollectionEditor collection={collection} />
      )}
    </div>
  );
}
