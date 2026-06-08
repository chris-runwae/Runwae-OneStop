"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Calendar, MapPin, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateRange } from "@/lib/format";

export function JoinTripClient({ joinCode }: { joinCode: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const preview = useQuery(api.trips.getInvitePreview, { joinCode });
  const joinByCode = useMutation(api.trips.joinByCode);

  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      await joinByCode({ joinCode });
      if (preview) router.push(`/trips/${preview.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't join this trip.");
      setJoining(false);
    }
  }

  if (preview === undefined) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-6 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-6 h-12 w-full rounded-full" />
      </main>
    );
  }

  if (preview === null) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Invalid invite link
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This join link is no longer valid or the trip was removed.
        </p>
        <Link
          href="/trips"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Go to my trips
        </Link>
      </main>
    );
  }

  const startMs = Date.parse(preview.startDate);
  const endMs = Date.parse(preview.endDate);
  const dateText =
    !Number.isNaN(startMs) && !Number.isNaN(endMs)
      ? formatDateRange(startMs, endMs, "UTC")
      : "";

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">
        You&apos;re invited
      </p>

      <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        {preview.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.coverImageUrl}
            alt=""
            className="h-44 w-full object-cover"
          />
        )}
        <div className="p-4">
          <h1 className="font-display text-xl font-bold text-foreground">
            {preview.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {preview.destinationLabel && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {preview.destinationLabel}
              </span>
            )}
            {dateText && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dateText}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {preview.memberCount}{" "}
              {preview.memberCount === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {authLoading ? (
        <Skeleton className="mt-6 h-12 w-full rounded-full" />
      ) : isAuthenticated ? (
        <button
          type="button"
          onClick={handleJoin}
          disabled={joining}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {joining ? "Joining…" : "Join trip"}
        </button>
      ) : (
        <Link
          href={`/sign-in?next=${encodeURIComponent(`/j/${joinCode}`)}`}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Sign in to join
        </Link>
      )}
    </main>
  );
}
