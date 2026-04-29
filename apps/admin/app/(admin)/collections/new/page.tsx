"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EntityType = Doc<"collections">["entityType"];

function errorMessage(e: unknown): string {
  if (e instanceof ConvexError) return String(e.data ?? e.message);
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export default function NewCollectionPage() {
  const router = useRouter();
  const create = useMutation(api.admin.collections.create);

  const [title, setTitle] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("destination");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);
    try {
      const doc = await create({ title: title.trim(), entityType });
      toast.success(`Created "${title.trim()}"`);
      if (doc?._id) router.push(`/collections/${doc._id}`);
      else router.push("/collections");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

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
          New collection
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a title and entity type. Type locks after create — changing it
          would invalidate every entityId. You'll add the items themselves on
          the next screen.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-5 rounded-lg border border-border bg-background p-6"
      >
        <div className="space-y-1.5">
          <Label className="text-xs">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Editor's picks: Lisbon"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Entity type (locked after create)</Label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as EntityType)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="destination">Destinations</option>
            <option value="event">Events</option>
            <option value="experience">Experiences</option>
            <option value="trip">Trips</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create collection
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/collections")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
