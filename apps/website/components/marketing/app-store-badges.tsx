import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

export function AppStoreBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Link
        href={site.appStore.ios}
        className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-background transition-opacity hover:opacity-90"
        aria-label="Download on the App Store"
      >
        <AppleMark />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide opacity-80">
            Download on the
          </span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </Link>
      <Link
        href={site.appStore.android}
        className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-background transition-opacity hover:opacity-90"
        aria-label="Get it on Google Play"
      >
        <PlayMark />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide opacity-80">
            Get it on
          </span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </Link>
    </div>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.41 2.21-1.23 3.04-.83.84-1.91 1.32-3.05 1.27-.05-1.14.4-2.23 1.22-3.06.84-.83 1.95-1.3 3.06-1.25zM20.5 17.18c-.6 1.37-1.32 2.7-2.36 3.84-1.04 1.14-2.05 1.6-3.18 1.6-1.18 0-1.94-.5-3.06-.5-1.16 0-1.91.5-3.06.5-1.13 0-2.13-.5-3.18-1.62-1.93-2.05-3.4-5.79-3.4-9.34 0-3.42 2.22-5.23 4.4-5.23 1.18 0 2.13.5 2.94.5.78 0 1.85-.55 3.18-.55 1.74 0 3.34.95 4.27 2.4-3.75 2.05-3.13 7.42 1.45 8.4z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="currentColor"
        d="M3.6 2.2 13 11.6 3.6 21l-.4-.2c-.2-.2-.3-.4-.3-.7V3.1c0-.3.1-.5.3-.7l.4-.2zM14.4 12.7l3.5 3.5-12.4 7.1 8.9-10.6zm0-2.2L5.5.7l12.4 7.1-3.5 3.5zm6.5-1.5c.5.3.8.8.8 1.4V13.6c0 .6-.3 1.1-.8 1.4l-2.8 1.6L15.5 12l2.6-3.6 2.8 1.6z"
      />
    </svg>
  );
}
