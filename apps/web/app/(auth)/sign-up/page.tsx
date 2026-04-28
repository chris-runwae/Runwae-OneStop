"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Mail,
  Search,
  User as UserIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { cn } from "@/lib/utils";
import { fireConfetti } from "@/components/splash/confetti";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CURRENCIES = ["GBP", "USD", "EUR", "JPY", "AUD"] as const;
type Currency = (typeof CURRENCIES)[number];

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_STEPS = 6;

// ---------------------------------------------------------------------------
// Shared UI primitives — kept inline so each step renders self-contained markup
// without prop-drilling style classes through every component.
// ---------------------------------------------------------------------------

const inputClass =
  "h-[52px] w-full rounded-2xl border-[1.5px] border-transparent bg-muted px-4 text-[15px] text-foreground placeholder:text-muted-foreground transition-[border-color,background] focus:border-primary focus:bg-background focus:outline-none";

const inputWithIcoWrap = "relative";

function StepHeader({ step, title, sub }: { step: number; title: string; sub: string }) {
  return (
    <>
      <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
        Step {step} of {TOTAL_STEPS}
      </div>
      <h1 className="mb-2 max-w-lg font-display text-[30px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground text-balance md:text-[38px]">
        {title}
      </h1>
      <p className="mb-7 max-w-xl text-[15px] leading-[1.45] text-muted-foreground text-pretty md:text-base">
        {sub}
      </p>
    </>
  );
}

function PrimaryButton({
  children,
  disabled,
  loading,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(255,61,127,0.32)] transition-[background,transform,box-shadow] active:scale-[0.97]",
        "hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(255,61,127,0.4)]",
        "disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:active:scale-100",
      )}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Email + SSO
// ---------------------------------------------------------------------------

interface Step1Props {
  email: string;
  setEmail: (v: string) => void;
  error: string | null;
  loading: boolean;
  onNext: () => void;
  onGoogle: () => void;
  googleLoading: boolean;
}

function Step1Email({
  email,
  setEmail,
  error,
  loading,
  onNext,
  onGoogle,
  googleLoading,
}: Step1Props) {
  const valid = EMAIL_RE.test(email);
  return (
    <>
      <StepHeader
        step={1}
        title="Welcome to Runwae"
        sub="Plan trips with people you love. Create your account in under a minute."
      />
      <div className="flex-1 space-y-3.5">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold text-muted-foreground">
            Email
          </span>
          <div className={inputWithIcoWrap}>
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              autoFocus
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && valid) onNext();
              }}
              className={cn(inputClass, "pl-[46px]")}
            />
          </div>
        </label>

        <div className="my-4 flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onGoogle}
            disabled={googleLoading}
            className="inline-flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full border-[1.5px] border-border bg-background text-[14.5px] font-semibold text-foreground transition-[background,border-color,transform] hover:bg-muted hover:border-input active:scale-[0.98]"
          >
            {googleLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.79 2.73v2.27h2.9c1.7-1.57 2.69-3.87 2.69-6.64z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.27c-.81.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.97v2.34A9 9 0 0 0 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.95 10.69A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.69V4.97H.97A9 9 0 0 0 0 9c0 1.45.35 2.83.97 4.03l2.98-2.34z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .97 4.97l2.98 2.34C4.66 5.18 6.65 3.58 9 3.58z"
                />
              </svg>
            )}
            Continue with Google
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="space-y-2.5 pt-4">
        <PrimaryButton disabled={!valid} loading={loading} onClick={onNext}>
          Continue <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </PrimaryButton>
        <p className="px-2 text-center text-[11.5px] leading-[1.5] text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Name + Password (with strength meter)
// ---------------------------------------------------------------------------

function passwordScore(p: string): number {
  return Math.min(
    4,
    (p.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(p) ? 1 : 0) +
      (/[0-9]/.test(p) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(p) ? 1 : 0),
  );
}

interface Step2Props {
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string | null;
  loading: boolean;
  onNext: () => void;
}

function Step2NamePassword({
  name,
  setName,
  password,
  setPassword,
  error,
  loading,
  onNext,
}: Step2Props) {
  const score = passwordScore(password);
  const valid = name.trim().length >= 2 && password.length >= 8;
  const hint =
    password.length === 0
      ? "Use 8+ characters with a mix of letters, numbers & symbols."
      : score <= 1
        ? "Weak — add numbers or symbols."
        : score === 2
          ? "Okay — try a longer phrase."
          : score === 3
            ? "Strong."
            : "Very strong.";
  return (
    <>
      <StepHeader
        step={2}
        title="Tell us your name"
        sub="This is how friends will find you on Runwae."
      />
      <div className="flex-1 space-y-3.5">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold text-muted-foreground">
            Full name
          </span>
          <div className={inputWithIcoWrap}>
            <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              autoComplete="name"
              placeholder="Maya Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(inputClass, "pl-[46px]")}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold text-muted-foreground">
            Password
          </span>
          <div className={inputWithIcoWrap}>
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && valid) onNext();
              }}
              className={cn(inputClass, "pl-[46px]")}
            />
          </div>
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < score ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[11.5px] tabular-nums text-muted-foreground">{hint}</p>
        </label>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="pt-4">
        <PrimaryButton disabled={!valid} loading={loading} onClick={onNext}>
          Continue <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </PrimaryButton>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Username
// ---------------------------------------------------------------------------

interface Step3Props {
  username: string;
  setUsername: (v: string) => void;
  availability: { available: boolean; reason?: string } | undefined;
  error: string | null;
  loading: boolean;
  onNext: () => void;
}

function Step3Username({
  username,
  setUsername,
  availability,
  error,
  loading,
  onNext,
}: Step3Props) {
  const showStatus = username.trim().length >= 3;
  const valid = showStatus && availability?.available !== false;
  return (
    <>
      <StepHeader
        step={3}
        title="Pick a username"
        sub="This is how friends will find you on Runwae. You can change it any time."
      />
      <div className="flex-1 space-y-2">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold text-muted-foreground">
            Username
          </span>
          <div className="relative flex h-[52px] w-full items-center rounded-2xl border-[1.5px] border-transparent bg-muted px-4 transition-[border-color,background] focus-within:border-primary focus-within:bg-background">
            <span className="text-[15px] text-muted-foreground">@</span>
            <input
              type="text"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && valid) onNext();
              }}
              className="ml-1 h-full flex-1 bg-transparent text-[15px] text-foreground focus:outline-none"
            />
          </div>
        </label>

        {showStatus && availability !== undefined && (
          <p
            className={cn(
              "text-xs",
              availability.available ? "text-emerald-600" : "text-destructive",
            )}
          >
            {availability.available
              ? `@${username} is available.`
              : (availability.reason ?? "Not available.")}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          3–20 characters. Lowercase letters, digits, and underscores only.
        </p>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="pt-4">
        <PrimaryButton disabled={!valid} loading={loading} onClick={onNext}>
          Continue <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </PrimaryButton>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Location preferences (currency + timezone)
// ---------------------------------------------------------------------------

interface Step4Props {
  preferredCurrency: Currency;
  setPreferredCurrency: (v: Currency) => void;
  preferredTimezone: string;
  setPreferredTimezone: (v: string) => void;
  error: string | null;
  loading: boolean;
  onNext: () => void;
}

function Step4Location({
  preferredCurrency,
  setPreferredCurrency,
  preferredTimezone,
  setPreferredTimezone,
  error,
  loading,
  onNext,
}: Step4Props) {
  return (
    <>
      <StepHeader
        step={4}
        title="Where are you based?"
        sub="We'll use this to surface nearby events, currencies, and times that match your day."
      />
      <div className="flex-1 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold text-muted-foreground">
            Currency
          </span>
          <select
            value={preferredCurrency}
            onChange={(e) => setPreferredCurrency(e.target.value as Currency)}
            className={cn(inputClass, "cursor-pointer pr-4")}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold text-muted-foreground">
            Timezone
          </span>
          <TimezonePicker value={preferredTimezone} onChange={setPreferredTimezone} />
        </label>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="pt-4">
        <PrimaryButton loading={loading} onClick={onNext}>
          Continue <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </PrimaryButton>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Traveller types (pill grid)
// ---------------------------------------------------------------------------

interface Step5Props {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  error: string | null;
  loading: boolean;
  onNext: () => void;
}

function Step5Interests({
  selectedTags,
  toggleTag,
  error,
  loading,
  onNext,
}: Step5Props) {
  const valid = selectedTags.length >= 1;
  return (
    <>
      <StepHeader
        step={5}
        title="What kind of traveller are you?"
        sub="Pick a few — we'll tailor your discover feed. Change these any time."
      />
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {TRAVELLER_TYPES.map((t) => {
            const on = selectedTags.includes(t.k);
            return (
              <button
                key={t.k}
                type="button"
                onClick={() => toggleTag(t.k)}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 rounded-2xl border-[1.5px] border-transparent bg-muted p-4 text-left transition-[transform,background,border-color] hover:-translate-y-0.5",
                  on && "border-primary bg-primary/10",
                )}
              >
                <span className="text-2xl leading-none">{t.emoji}</span>
                <span
                  className={cn(
                    "text-sm font-semibold text-foreground",
                    on && "text-primary",
                  )}
                >
                  {t.k}
                </span>
                <span
                  className={cn(
                    "absolute right-2.5 top-2.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200",
                    on ? "scale-100" : "scale-0",
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={2.6} />
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3.5 text-center text-[12.5px] font-medium text-muted-foreground">
          {selectedTags.length === 0 ? (
            "Pick at least one to continue."
          ) : (
            <>
              <b className="font-bold text-primary">{selectedTags.length}</b> selected
            </>
          )}
        </p>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="pt-4">
        <PrimaryButton disabled={!valid} loading={loading} onClick={onNext}>
          Continue <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </PrimaryButton>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 6 — Find friends
// ---------------------------------------------------------------------------

interface SearchResult {
  _id: string;
  name?: string;
  image?: string;
  username?: string;
}

interface Step6Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  results: SearchResult[] | undefined;
  followingIds: string[];
  toggleFollow: (id: string) => void;
  error: string | null;
  loading: boolean;
  onFinish: () => void;
}

function Step6Friends({
  searchTerm,
  setSearchTerm,
  results,
  followingIds,
  toggleFollow,
  error,
  loading,
  onFinish,
}: Step6Props) {
  return (
    <>
      <StepHeader
        step={6}
        title="Follow some friends"
        sub="See where they're going next. You can always add more later."
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <label className="block">
          <span className="sr-only">Search</span>
          <div className={inputWithIcoWrap}>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              spellCheck={false}
              autoComplete="off"
              placeholder="Search by username…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className={cn(inputClass, "pl-[46px]")}
            />
          </div>
        </label>

        <div className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {searchTerm.length >= 2 ? "Results" : "Suggested for you"}
        </div>

        <div className="mt-3 flex-1 overflow-y-auto">
          {results && results.length > 0 ? (
            <ul className="space-y-0">
              {results.map((u) => {
                const on = followingIds.includes(u._id);
                return (
                  <li
                    key={u._id}
                    className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    {u.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.image}
                        alt={u.name ?? "User"}
                        className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase text-muted-foreground">
                        {(u.name ?? u.username ?? "?").charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {u.name ?? "Unnamed user"}
                      </div>
                      {u.username && (
                        <div className="truncate text-xs text-muted-foreground">
                          @{u.username}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFollow(u._id)}
                      className={cn(
                        "h-[34px] flex-shrink-0 rounded-full px-3.5 text-[12.5px] font-semibold transition-[background,transform] active:scale-95",
                        on
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {on ? "Following" : "Follow"}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : results && results.length === 0 && searchTerm.length >= 2 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No users found for &ldquo;{searchTerm}&rdquo;.
            </p>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Search for someone by their username to follow them. You can always add
              friends later.
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="pt-4">
        <PrimaryButton loading={loading} onClick={onFinish}>
          {followingIds.length > 0
            ? `Finish — follow ${followingIds.length}`
            : "Skip & finish"}
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </PrimaryButton>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Completion screen
// ---------------------------------------------------------------------------

function CompleteScreen({ name, onEnter }: { name: string; onEnter: () => void }) {
  useEffect(() => {
    fireConfetti();
  }, []);
  const first = name ? name.split(" ")[0] : "";
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="rw-pop-in mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_36px_rgba(255,61,127,0.4)]">
        <Check className="h-10 w-10" strokeWidth={2.6} />
      </div>
      <h1 className="mb-2 font-display text-[34px] font-bold leading-tight tracking-[-0.02em] text-foreground">
        You&apos;re in{first ? `, ${first}` : ""}!
      </h1>
      <p className="mb-6 max-w-sm text-[15px] text-muted-foreground">
        Welcome to Runwae. Let&apos;s plan something good.
      </p>
      <div className="w-full max-w-[280px]">
        <PrimaryButton onClick={onEnter}>
          Enter Runwae <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export default function SignUpPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const updateProfile = useMutation(api.users.updateProfile);
  const setUsernameMut = useMutation(api.users.setUsername);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>("GBP");
  const [preferredTimezone, setPreferredTimezone] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  // If a user lands here already authenticated (e.g. after Google OAuth)
  // but onboarding is incomplete, jump them to the username step and pre-fill
  // any fields the auth callback already populated.
  const viewer = useQuery(api.users.getCurrentUser, {});
  const jumpedRef = useRef(false);
  useEffect(() => {
    if (jumpedRef.current) return;
    if (viewer && viewer.onboardingComplete !== true) {
      jumpedRef.current = true;
      if (viewer.username) setUsername(viewer.username);
      if (viewer.preferredCurrency) {
        const c = viewer.preferredCurrency as Currency;
        if ((CURRENCIES as readonly string[]).includes(c)) setPreferredCurrency(c);
      }
      if (viewer.preferredTimezone) setPreferredTimezone(viewer.preferredTimezone);
      if (viewer.travellerTags && viewer.travellerTags.length > 0) {
        setSelectedTags([...viewer.travellerTags]);
      }
      setStep(2);
    } else if (viewer && viewer.onboardingComplete === true) {
      router.replace("/home");
    }
  }, [viewer, router]);

  const usernameAvailability = useQuery(
    api.users.isUsernameAvailable,
    username.trim().length >= 3 ? { username: username.trim() } : "skip",
  );

  const searchResults = useQuery(
    api.users.searchByUsername,
    searchTerm.length >= 2 ? { term: searchTerm } : "skip",
  ) as SearchResult[] | undefined;

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const clearError = () => setError(null);

  function handleStep1Next() {
    clearError();
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStep(1);
  }

  async function handleStep2Next() {
    clearError();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await signIn("password", {
        email,
        password,
        name: name.trim(),
        flow: "signUp",
      });
      setStep(2);
    } catch (err) {
      console.error("[sign-up] signIn failed", err);
      let msg = "Sign up failed. Please try again.";
      if (err instanceof Error && err.message) msg = err.message;
      else if (err && typeof err === "object") {
        const anyErr = err as { data?: unknown; message?: string };
        if (anyErr.message) msg = anyErr.message;
        else if (anyErr.data) msg = `Sign up failed: ${JSON.stringify(anyErr.data)}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleStep3Next() {
    clearError();
    const u = username.trim();
    if (u.length < 3) {
      setError("Pick a username (at least 3 characters).");
      return;
    }
    setLoading(true);
    try {
      await setUsernameMut({ username: u });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that username.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep4Next() {
    clearError();
    setLoading(true);
    try {
      await updateProfile({
        preferredCurrency,
        preferredTimezone: preferredTimezone.trim() || "UTC",
      });
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep5Next() {
    clearError();
    if (selectedTags.length === 0) {
      setError("Please select at least one traveller type.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ travellerTags: selectedTags });
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save your preferences.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    clearError();
    setLoading(true);
    try {
      await completeOnboarding();
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    clearError();
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleGoogle() {
    clearError();
    setGoogleLoading(true);
    try {
      await signIn("google");
    } catch (err) {
      console.error("[sign-up] Google signIn failed", err);
      setError(err instanceof Error ? err.message : "Google sign in failed.");
      setGoogleLoading(false);
    }
  }

  if (done) {
    return <CompleteScreen name={name} onEnter={() => router.push("/home")} />;
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-background text-foreground">
      {/* Top bar: back + linear progress + step counter */}
      <div className="flex items-center gap-3.5 px-5 pt-5">
        <button
          type="button"
          onClick={step === 0 ? () => router.push("/") : handleBack}
          aria-label="Back"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-colors hover:bg-input"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-[cubic-bezier(.2,.9,.25,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="min-w-[34px] text-right text-xs font-semibold tabular-nums text-muted-foreground">
          {step + 1}/{TOTAL_STEPS}
        </div>
      </div>

      {/* Slide stage */}
      <div className="relative flex-1 overflow-hidden">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i).map((i) => (
          <div
            key={i}
            aria-hidden={i !== step}
            className={cn(
              "absolute inset-0 mx-auto flex w-full max-w-xl flex-col px-5 pb-6 pt-8 transition-[transform,opacity] duration-[460ms] ease-[cubic-bezier(.2,.9,.25,1)] md:px-7 md:pt-12",
              i === step && "translate-x-0 opacity-100",
              i > step && "pointer-events-none translate-x-16 opacity-0",
              i < step && "pointer-events-none -translate-x-16 opacity-0",
            )}
          >
            {i === 0 && (
              <Step1Email
                email={email}
                setEmail={(v) => {
                  setEmail(v);
                  clearError();
                }}
                error={error}
                loading={loading}
                onNext={handleStep1Next}
                onGoogle={handleGoogle}
                googleLoading={googleLoading}
              />
            )}
            {i === 1 && (
              <Step2NamePassword
                name={name}
                setName={(v) => {
                  setName(v);
                  clearError();
                }}
                password={password}
                setPassword={(v) => {
                  setPassword(v);
                  clearError();
                }}
                error={error}
                loading={loading}
                onNext={handleStep2Next}
              />
            )}
            {i === 2 && (
              <Step3Username
                username={username}
                setUsername={(v) => {
                  setUsername(v);
                  clearError();
                }}
                availability={usernameAvailability}
                error={error}
                loading={loading}
                onNext={handleStep3Next}
              />
            )}
            {i === 3 && (
              <Step4Location
                preferredCurrency={preferredCurrency}
                setPreferredCurrency={setPreferredCurrency}
                preferredTimezone={preferredTimezone}
                setPreferredTimezone={setPreferredTimezone}
                error={error}
                loading={loading}
                onNext={handleStep4Next}
              />
            )}
            {i === 4 && (
              <Step5Interests
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                error={error}
                loading={loading}
                onNext={handleStep5Next}
              />
            )}
            {i === 5 && (
              <Step6Friends
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                results={searchResults}
                followingIds={followingIds}
                toggleFollow={toggleFollow}
                error={error}
                loading={loading}
                onFinish={handleFinish}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
