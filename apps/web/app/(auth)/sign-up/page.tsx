"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CURRENCIES = ["GBP", "USD", "EUR", "JPY", "AUD"] as const;
type Currency = (typeof CURRENCIES)[number];

const TRAVELLER_TAGS = [
  "Beach",
  "Adventure",
  "Foodie",
  "Culture",
  "Nature",
  "City",
  "Luxury",
  "Budget",
  "Family",
  "Solo",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEP_LABELS = [
  "Email",
  "Password & name",
  "Username",
  "Location prefs",
  "Traveller type",
  "Find friends",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 pb-2">
      {STEP_LABELS.map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i <= current ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none";

// ---------------------------------------------------------------------------
// Step sub-components (declared inline, typed with explicit prop interfaces)
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
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start planning unforgettable trips
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onGoogle}
        isLoading={googleLoading}
        disabled={googleLoading || loading}
      >
        Continue with Google
      </Button>

      <div className="relative text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-background px-3">Or with email</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>

      <input
        type="email"
        required
        autoComplete="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputCls}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full" isLoading={loading} disabled={loading}>
        Continue
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

interface Step2Props {
  password: string;
  setPassword: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  error: string | null;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
}

function Step2Password({
  password,
  setPassword,
  name,
  setName,
  error,
  loading,
  onNext,
  onBack,
}: Step2Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Set a password
        </h1>
        <p className="text-sm text-muted-foreground">
          And tell us what to call you
        </p>
      </div>

      <input
        type="text"
        required
        autoComplete="name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputCls}
      />

      <input
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputCls}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" isLoading={loading} disabled={loading}>
          Continue
        </Button>
      </div>
    </form>
  );
}

interface StepUsernameProps {
  username: string;
  setUsername: (v: string) => void;
  availability: { available: boolean; reason?: string } | undefined;
  error: string | null;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
}

function StepUsername({
  username,
  setUsername,
  availability,
  error,
  loading,
  onNext,
  onBack,
}: StepUsernameProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }
  const showStatus = username.trim().length >= 3;
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Pick a username
        </h1>
        <p className="text-sm text-muted-foreground">
          This is how friends will find you on Runwae. You can change it later.
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex h-11 items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
          <span className="text-sm text-muted-foreground">@</span>
          <input
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="ml-1 h-full flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        {showStatus && availability !== undefined && (
          <p
            className={cn(
              "text-xs",
              availability.available ? "text-emerald-600" : "text-destructive"
            )}
          >
            {availability.available
              ? `@${username} is available.`
              : availability.reason ?? "Not available."}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          3–20 characters. Lowercase letters, digits, and underscores only.
        </p>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-1"
          isLoading={loading}
          disabled={loading || !showStatus || availability?.available === false}
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

interface Step3Props {
  preferredCurrency: Currency;
  setPreferredCurrency: (v: Currency) => void;
  preferredTimezone: string;
  setPreferredTimezone: (v: string) => void;
  error: string | null;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
}

function Step3Location({
  preferredCurrency,
  setPreferredCurrency,
  preferredTimezone,
  setPreferredTimezone,
  error,
  loading,
  onNext,
  onBack,
}: Step3Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Location preferences
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll use these to tailor your experience
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Currency
        </label>
        <select
          value={preferredCurrency}
          onChange={(e) => setPreferredCurrency(e.target.value as Currency)}
          className={cn(inputCls, "cursor-pointer")}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Timezone
        </label>
        <TimezonePicker
          value={preferredTimezone}
          onChange={setPreferredTimezone}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" isLoading={loading} disabled={loading}>
          Continue
        </Button>
      </div>
    </form>
  );
}

interface Step4Props {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  error: string | null;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
}

function Step4TravellerType({
  selectedTags,
  toggleTag,
  error,
  loading,
  onNext,
  onBack,
}: Step4Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          What kind of traveller are you?
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick at least one that fits you
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRAVELLER_TAGS.map((tag) => (
          <Chip
            key={tag}
            selected={selectedTags.includes(tag)}
            onClick={() => toggleTag(tag)}
            type="button"
          >
            {tag}
          </Chip>
        ))}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" isLoading={loading} disabled={loading}>
          Continue
        </Button>
      </div>
    </form>
  );
}

interface SearchResult {
  _id: string;
  name?: string;
  image?: string;
  username?: string;
}

interface Step5Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  results: SearchResult[] | undefined;
  error: string | null;
  loading: boolean;
  onFinish: () => void;
  onBack: () => void;
}

function Step5FindFriends({
  searchTerm,
  setSearchTerm,
  results,
  error,
  loading,
  onFinish,
  onBack,
}: Step5Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Find friends
        </h1>
        <p className="text-sm text-muted-foreground">
          Search for people you know on Runwae
        </p>
      </div>

      <div className="flex h-11 items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
        <span className="text-sm text-muted-foreground">@</span>
        <input
          type="text"
          placeholder="Search by username…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          className="ml-1 h-full flex-1 bg-transparent text-sm focus:outline-none"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {results && results.length > 0 && (
        <ul className="space-y-2 rounded-xl border border-border bg-background p-2">
          {results.map((u) => (
            <li key={u._id} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
              {u.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.image}
                  alt={u.name ?? "User"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase text-muted-foreground">
                  {(u.name ?? u.username ?? "?").charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {u.name ?? "Unnamed user"}
                </div>
                {u.username && (
                  <div className="truncate text-xs text-muted-foreground">@{u.username}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {results && results.length === 0 && searchTerm.length >= 2 && (
        <p className="text-center text-sm text-muted-foreground">No users found</p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          isLoading={loading}
          disabled={loading}
          onClick={onFinish}
        >
          Finish
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------

export default function SignUpPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const updateProfile = useMutation(api.users.updateProfile);
  const setUsernameMut = useMutation(api.users.setUsername);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  // Wizard state
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Step 3 — username
  const [username, setUsername] = useState("");

  // Step 4
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>("GBP");
  const [preferredTimezone, setPreferredTimezone] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // If the user is already authenticated when they land here (e.g. after
  // Google OAuth) but hasn't finished onboarding, jump straight to step 2
  // (Username — auto-generated by the auth callback, but the user can edit).
  const viewer = useQuery(api.users.getCurrentUser, {});
  const jumpedRef = useRef(false);
  useEffect(() => {
    if (jumpedRef.current) return;
    if (viewer && viewer.onboardingComplete !== true) {
      jumpedRef.current = true;
      // Pre-fill from the existing profile so the user sees their data.
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

  // Step 5
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Step 6
  const [searchTerm, setSearchTerm] = useState("");

  // Username live availability check — only when the field is non-trivial.
  const usernameAvailability = useQuery(
    api.users.isUsernameAvailable,
    username.trim().length >= 3 ? { username: username.trim() } : "skip",
  );

  // Debounced username search: only send if >= 2 chars
  const searchResults = useQuery(
    api.users.searchByUsername,
    searchTerm.length >= 2 ? { term: searchTerm } : "skip",
  ) as SearchResult[] | undefined;

  // ------------------------------------------------------------------
  // Tag toggle
  // ------------------------------------------------------------------
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // ------------------------------------------------------------------
  // Step handlers
  // ------------------------------------------------------------------

  function clearError() {
    setError(null);
  }

  // Step 1 → 2: validate email
  function handleStep1Next() {
    clearError();
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStep(1);
  }

  // Step 2 → 3 (Username): call signIn("password", {..., flow:"signUp"})
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

  // Step 3 → 4 (Location): persist username
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

  // Step 4 → 5 (Tags): save currency + timezone
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

  // Step 5 → 6 (Find friends): save traveller tags
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

  // Step 5: finish onboarding
  async function handleFinish() {
    clearError();
    setLoading(true);
    try {
      await completeOnboarding();
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
      // Google OAuth handles its own redirect; on return the user lands
      // authenticated. Onboarding fields can be completed via Profile later.
      await signIn("google");
    } catch (err) {
      console.error("[sign-up] Google signIn failed", err);
      setError(err instanceof Error ? err.message : "Google sign in failed.");
      setGoogleLoading(false);
    }
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <ProgressDots current={step} />

      {step === 0 && (
        <Step1Email
          email={email}
          setEmail={(v) => { setEmail(v); clearError(); }}
          error={error}
          loading={loading}
          onNext={handleStep1Next}
          onGoogle={handleGoogle}
          googleLoading={googleLoading}
        />
      )}

      {step === 1 && (
        <Step2Password
          password={password}
          setPassword={(v) => { setPassword(v); clearError(); }}
          name={name}
          setName={(v) => { setName(v); clearError(); }}
          error={error}
          loading={loading}
          onNext={handleStep2Next}
          onBack={handleBack}
        />
      )}

      {step === 2 && (
        <StepUsername
          username={username}
          setUsername={(v) => { setUsername(v); clearError(); }}
          availability={usernameAvailability}
          error={error}
          loading={loading}
          onNext={handleStep3Next}
          onBack={handleBack}
        />
      )}

      {step === 3 && (
        <Step3Location
          preferredCurrency={preferredCurrency}
          setPreferredCurrency={setPreferredCurrency}
          preferredTimezone={preferredTimezone}
          setPreferredTimezone={setPreferredTimezone}
          error={error}
          loading={loading}
          onNext={handleStep4Next}
          onBack={handleBack}
        />
      )}

      {step === 4 && (
        <Step4TravellerType
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          error={error}
          loading={loading}
          onNext={handleStep5Next}
          onBack={handleBack}
        />
      )}

      {step === 5 && (
        <Step5FindFriends
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          results={searchResults}
          error={error}
          loading={loading}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
