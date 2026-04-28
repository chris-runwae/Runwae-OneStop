"use client";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UnsplashPicker } from "./UnsplashPicker";

const CURRENCIES = ["GBP", "USD", "EUR", "JPY", "AUD"] as const;
type Currency = (typeof CURRENCIES)[number];

const VISIBILITIES = ["private", "friends", "public"] as const;
type Visibility = (typeof VISIBILITIES)[number];

const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: "Private",
  friends: "Friends",
  public: "Public",
};

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none";

export type DetailsValue = {
  title: string;
  description: string;
  coverImageUrl: string;
  currency: Currency;
  visibility: Visibility;
};

export function StepDetails({
  value,
  onChange,
  error,
  onNext,
  onBack,
  seedQuery = "",
}: {
  value: DetailsValue;
  onChange: (v: DetailsValue) => void;
  error: string | null;
  onNext: () => void;
  onBack: () => void;
  // Used to seed the Unsplash search — typically the destination label
  // from step 0 of the wizard.
  seedQuery?: string;
}) {
  function set<K extends keyof DetailsValue>(key: K, val: DetailsValue[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Trip details</h2>
        <p className="text-sm text-muted-foreground">Give your trip a name and a few extras.</p>
      </header>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Summer in Japan"
          value={value.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          placeholder="What's this trip about?"
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={cn(
            inputCls,
            "h-auto resize-none py-3 leading-normal"
          )}
        />
      </div>

      {/* Cover image — Unsplash picker, with manual URL override. */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Cover image</label>
        {value.coverImageUrl.trim() && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.coverImageUrl.trim()}
            alt="Cover preview"
            className="h-28 w-full rounded-xl object-cover"
          />
        )}
        <UnsplashPicker
          seedQuery={seedQuery}
          selectedUrl={value.coverImageUrl}
          onSelect={(url) => set("coverImageUrl", url)}
        />
        <details className="group">
          <summary className="cursor-pointer text-[11px] font-medium text-muted-foreground hover:text-foreground">
            Or paste a URL
          </summary>
          <input
            type="url"
            placeholder="https://..."
            value={value.coverImageUrl}
            onChange={(e) => set("coverImageUrl", e.target.value)}
            className={cn(inputCls, "mt-2")}
          />
        </details>
      </div>

      {/* Currency */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Currency</label>
        <select
          value={value.currency}
          onChange={(e) => set("currency", e.target.value as Currency)}
          className={cn(inputCls, "cursor-pointer")}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Visibility</label>
        <div className="flex gap-2">
          {VISIBILITIES.map((v) => (
            <Chip
              key={v}
              type="button"
              selected={value.visibility === v}
              onClick={() => set("visibility", v)}
            >
              {VISIBILITY_LABELS[v]}
            </Chip>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="button" size="lg" className="flex-1" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
