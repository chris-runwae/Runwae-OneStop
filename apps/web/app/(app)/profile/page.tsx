"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  AtSign,
  Camera,
  Check,
  Globe,
  LogOut,
  Mail,
  Pencil,
  Tag,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { cn } from "@/lib/utils";

const CURRENCIES = ["GBP", "USD", "EUR", "JPY", "AUD", "CAD", "MXN"] as const;
const TRAVELLER_TYPES = [
  { k: "Adventure", emoji: "⛰" },
  { k: "Culture", emoji: "🏛" },
  { k: "Foodie", emoji: "🍽" },
  { k: "Festivals", emoji: "🎟" },
  { k: "Beach", emoji: "🌊" },
  { k: "City", emoji: "🏙" },
  { k: "Luxury", emoji: "✨" },
  { k: "Budget", emoji: "🎒" },
  { k: "Nature", emoji: "🌿" },
  { k: "Family", emoji: "👨‍👩‍👧" },
  { k: "Solo", emoji: "🎒" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuthActions();

  const viewer = useQuery(api.users.getCurrentUser, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const setUsernameMut = useMutation(api.users.setUsername);
  const generateAvatarUploadUrl = useMutation(
    api.users.generateAvatarUploadUrl
  );
  const setAvatar = useMutation(api.users.setAvatar);

  const [signingOut, setSigningOut] = useState(false);

  // ── username
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const usernameAvailability = useQuery(
    api.users.isUsernameAvailable,
    editingUsername && usernameDraft.trim().length >= 3
      ? { username: usernameDraft.trim() }
      : "skip"
  );

  // ── name
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  // ── tags
  const [editingTags, setEditingTags] = useState(false);
  const [tagsDraft, setTagsDraft] = useState<string[]>([]);
  const [savingTags, setSavingTags] = useState(false);

  // ── currency / timezone
  const [editingCT, setEditingCT] = useState(false);
  const [currencyDraft, setCurrencyDraft] = useState("GBP");
  const [timezoneDraft, setTimezoneDraft] = useState("UTC");
  const [savingCT, setSavingCT] = useState(false);
  const [ctError, setCtError] = useState<string | null>(null);

  // ── avatar
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (editingUsername) {
      setUsernameDraft(viewer?.username ?? "");
      setUsernameError(null);
    }
  }, [editingUsername, viewer?.username]);

  useEffect(() => {
    if (editingName) setNameDraft(viewer?.name ?? "");
  }, [editingName, viewer?.name]);

  useEffect(() => {
    if (editingTags) setTagsDraft([...(viewer?.travellerTags ?? [])]);
  }, [editingTags, viewer?.travellerTags]);

  useEffect(() => {
    if (editingCT) {
      setCurrencyDraft(viewer?.preferredCurrency ?? "GBP");
      setTimezoneDraft(viewer?.preferredTimezone ?? "UTC");
      setCtError(null);
    }
  }, [editingCT, viewer?.preferredCurrency, viewer?.preferredTimezone]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch {
      setSigningOut(false);
    }
  }

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
      setUsernameError(
        err instanceof Error ? err.message : "Couldn't save username."
      );
    } finally {
      setSavingUsername(false);
    }
  }

  async function saveName() {
    if (!nameDraft.trim()) return;
    setSavingName(true);
    try {
      await updateProfile({ name: nameDraft.trim() });
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  }

  async function saveTags() {
    setSavingTags(true);
    try {
      await updateProfile({ travellerTags: tagsDraft });
      setEditingTags(false);
    } finally {
      setSavingTags(false);
    }
  }

  async function saveCurrencyTimezone() {
    setSavingCT(true);
    setCtError(null);
    try {
      await updateProfile({
        preferredCurrency: currencyDraft,
        preferredTimezone: timezoneDraft,
      });
      setEditingCT(false);
    } catch (err) {
      setCtError(
        err instanceof Error ? err.message : "Couldn't save preferences."
      );
    } finally {
      setSavingCT(false);
    }
  }

  async function handleAvatarChange(file: File) {
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please pick an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const uploadUrl = await generateAvatarUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const { storageId } = (await res.json()) as { storageId: string };
      await setAvatar({ storageId: storageId as never });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  function toggleTagDraft(tag: string) {
    setTagsDraft((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Profile
      </h1>

      {viewer === undefined ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : viewer === null ? (
        <p className="mt-6 text-sm text-muted-foreground">Not signed in.</p>
      ) : (
        <>
          {/* Avatar + name header */}
          <section className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="group relative shrink-0"
              aria-label="Change avatar"
            >
              <Avatar
                src={viewer.image}
                name={viewer.name ?? undefined}
                size="lg"
              />
              <span className="absolute inset-0 grid place-items-center rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
                <Camera className="h-5 w-5" />
              </span>
              {uploadingAvatar && (
                <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 text-white">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleAvatarChange(f);
                e.target.value = "";
              }}
            />

            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={saveName}
                    disabled={savingName || !nameDraft.trim()}
                    aria-label="Save name"
                    className="grid h-7 w-7 place-items-center rounded-full text-primary hover:bg-primary/10 disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingName(false)}
                    aria-label="Cancel"
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="truncate text-base font-semibold text-foreground">
                    {viewer.name ?? "Unnamed"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    <Pencil className="inline h-3 w-3" /> Edit
                  </button>
                </div>
              )}
              {viewer.username && (
                <div className="truncate text-xs text-muted-foreground">
                  @{viewer.username}
                </div>
              )}
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {viewer.plan ?? "free"}
              </div>
              {avatarError && (
                <p className="mt-1 text-[11px] text-error">{avatarError}</p>
              )}
            </div>
          </section>

          {/* Settings list */}
          <section className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {/* Username row */}
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 text-muted-foreground">
                <AtSign className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Username
                </div>
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
                        onChange={(e) =>
                          setUsernameDraft(e.target.value.toLowerCase())
                        }
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
                    {usernameAvailability !== undefined &&
                      usernameDraft.trim().length >= 3 && (
                        <p
                          className={cn(
                            "text-[11px]",
                            usernameAvailability.available
                              ? "text-emerald-600"
                              : "text-destructive"
                          )}
                        >
                          {usernameAvailability.available
                            ? `@${usernameDraft.trim()} is available.`
                            : usernameAvailability.reason ?? "Not available."}
                        </p>
                      )}
                    {usernameError && (
                      <p className="text-[11px] text-destructive">
                        {usernameError}
                      </p>
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

            <Row
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={viewer.email ?? "—"}
            />

            {/* Currency + timezone row (paired edit) */}
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 text-muted-foreground">
                <Globe className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Currency · Timezone
                </div>
                {editingCT ? (
                  <div className="mt-2 space-y-2">
                    <select
                      value={currencyDraft}
                      onChange={(e) => setCurrencyDraft(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-2 text-sm focus:border-primary focus:outline-none"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <TimezonePicker
                      value={timezoneDraft}
                      onChange={setTimezoneDraft}
                    />
                    {ctError && (
                      <p className="text-[11px] text-destructive">{ctError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveCurrencyTimezone}
                        disabled={savingCT}
                        className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCT(false)}
                        className="h-9 rounded-full bg-foreground/5 px-4 text-xs font-semibold text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {viewer.preferredCurrency ?? "GBP"} ·{" "}
                      {viewer.preferredTimezone ?? "UTC"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCT(true)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      <Pencil className="inline h-3 w-3" /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Traveller tags row */}
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 text-muted-foreground">
                <Tag className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Traveller tags
                </div>
                {editingTags ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {TRAVELLER_TYPES.map((t) => {
                        const on = tagsDraft.includes(t.k);
                        return (
                          <button
                            key={t.k}
                            type="button"
                            onClick={() => toggleTagDraft(t.k)}
                            className={cn(
                              "h-8 rounded-full border px-3 text-[12px] font-medium transition-colors",
                              on
                                ? "border-transparent bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:bg-muted"
                            )}
                          >
                            <span className="mr-1">{t.emoji}</span>
                            {t.k}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveTags}
                        disabled={savingTags}
                        className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTags(false)}
                        className="h-9 rounded-full bg-foreground/5 px-4 text-xs font-semibold text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="line-clamp-2 text-sm font-medium text-foreground">
                      {viewer.travellerTags && viewer.travellerTags.length > 0
                        ? viewer.travellerTags.join(", ")
                        : "None set"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingTags(true)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      <Pencil className="inline h-3 w-3" /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
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
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
