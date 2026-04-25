"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { AtSign, Check, LogOut, Mail, Globe, Pencil, Tag, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const setUsernameMut = useMutation(api.users.setUsername);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const usernameAvailability = useQuery(
    api.users.isUsernameAvailable,
    editingUsername && usernameDraft.trim().length >= 3
      ? { username: usernameDraft.trim() }
      : "skip",
  );
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

  // Sync the draft to the viewer's current username when entering edit mode.
  useEffect(() => {
    if (editingUsername) {
      setUsernameDraft(viewer?.username ?? "");
      setUsernameError(null);
    }
  }, [editingUsername, viewer?.username]);

  async function saveUsername() {
    setUsernameError(null);
    const candidate = usernameDraft.trim();
    if (candidate === viewer?.username) {
      setEditingUsername(false);
      return;
    }
    setSavingUsername(true);
    try {
      await setUsernameMut({ username: candidate });
      setEditingUsername(false);
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : "Couldn't save username.");
    } finally {
      setSavingUsername(false);
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
              {viewer.username && (
                <div className="truncate text-xs text-muted-foreground">@{viewer.username}</div>
              )}
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {viewer.plan ?? "free"}
              </div>
            </div>
          </section>

          <section className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 text-muted-foreground"><AtSign className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Username</div>
                {editingUsername ? (
                  <div className="mt-1 space-y-1">
                    <div className="flex h-9 items-center rounded-lg border border-border bg-background px-2 focus-within:border-primary">
                      <span className="text-sm text-muted-foreground">@</span>
                      <input
                        type="text"
                        value={usernameDraft}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                        onChange={(e) => setUsernameDraft(e.target.value.toLowerCase())}
                        className="ml-1 h-full flex-1 bg-transparent text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Save username"
                        onClick={saveUsername}
                        disabled={
                          savingUsername ||
                          usernameDraft.trim().length < 3 ||
                          (usernameAvailability !== undefined &&
                            usernameAvailability.available === false)
                        }
                        className="ml-1 grid h-7 w-7 place-items-center rounded-full text-primary hover:bg-primary/10 disabled:opacity-40"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Cancel"
                        onClick={() => setEditingUsername(false)}
                        className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {usernameAvailability !== undefined && usernameDraft.trim().length >= 3 && (
                      <p
                        className={cn(
                          "text-[11px]",
                          usernameAvailability.available
                            ? "text-emerald-600"
                            : "text-destructive",
                        )}
                      >
                        {usernameAvailability.available
                          ? `@${usernameDraft.trim()} is available.`
                          : usernameAvailability.reason ?? "Not available."}
                      </p>
                    )}
                    {usernameError && (
                      <p className="text-[11px] text-destructive">{usernameError}</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {viewer.username ? `@${viewer.username}` : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingUsername(true)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      <Pencil className="inline h-3 w-3" /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
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
