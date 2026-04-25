"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, Mail, Globe, Tag } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.getCurrentUser, {});
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>

      {viewer === undefined ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : viewer === null ? (
        <p className="mt-6 text-sm text-muted-foreground">Not signed in.</p>
      ) : (
        <>
          <section className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <Avatar src={viewer.image} name={viewer.name ?? undefined} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold text-foreground">
                {viewer.name ?? "Unnamed"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {viewer.email ?? ""}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {viewer.plan ?? "free"}
              </div>
            </div>
          </section>

          <section className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={viewer.email ?? "—"} />
            <Row
              icon={<Globe className="h-4 w-4" />}
              label="Currency · Timezone"
              value={`${viewer.preferredCurrency ?? "GBP"} · ${viewer.preferredTimezone ?? "UTC"}`}
            />
            <Row
              icon={<Tag className="h-4 w-4" />}
              label="Traveller tags"
              value={
                viewer.travellerTags && viewer.travellerTags.length > 0
                  ? viewer.travellerTags.join(", ")
                  : "None set"
              }
            />
          </section>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="mt-6 w-full"
            onClick={handleSignOut}
            isLoading={signingOut}
            disabled={signingOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </>
      )}
    </main>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}
