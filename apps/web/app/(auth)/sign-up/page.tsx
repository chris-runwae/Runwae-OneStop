"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
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
}

function Step1Email({ email, setEmail, error, loading, onNext }: Step1Props) {
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
        <input
          type="text"
          value={preferredTimezone}
          onChange={(e) => setPreferredTimezone(e.target.value)}
          className={inputCls}
          placeholder="e.g. Europe/London"
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

      <input
        type="text"
        placeholder="Search by email…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={inputCls}
        autoComplete="off"
      />

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
                  {(u.name ?? "?").charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-foreground">
                {u.name ?? "Unnamed user"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {results && results.length === 0 && searchTerm.length >= 3 && (
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
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  // Wizard state
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Step 3
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>("GBP");
  const [preferredTimezone, setPreferredTimezone] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Step 4
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Step 5
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced query arg: only send if >= 3 chars
  const searchResults = useQuery(
    api.users.searchByEmail,
    searchTerm.length >= 3 ? { email: searchTerm } : "skip"
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

  // Step 2 → 3: call signIn("password", {..., flow:"signUp"})
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
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3 → 4: save currency + timezone
  async function handleStep3Next() {
    clearError();
    setLoading(true);
    try {
      await updateProfile({
        preferredCurrency,
        preferredTimezone: preferredTimezone.trim() || "UTC",
      });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  }

  // Step 4 → 5: save traveller tags
  async function handleStep4Next() {
    clearError();
    if (selectedTags.length === 0) {
      setError("Please select at least one traveller type.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ travellerTags: selectedTags });
      setStep(4);
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
        <Step3Location
          preferredCurrency={preferredCurrency}
          setPreferredCurrency={setPreferredCurrency}
          preferredTimezone={preferredTimezone}
          setPreferredTimezone={setPreferredTimezone}
          error={error}
          loading={loading}
          onNext={handleStep3Next}
          onBack={handleBack}
        />
      )}

      {step === 3 && (
        <Step4TravellerType
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          error={error}
          loading={loading}
          onNext={handleStep4Next}
          onBack={handleBack}
        />
      )}

      {step === 4 && (
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
