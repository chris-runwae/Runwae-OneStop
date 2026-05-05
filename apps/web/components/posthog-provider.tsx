"use client";

import { useQuery } from "convex/react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect, type ReactNode } from "react";
import { api } from "@/convex/_generated/api";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: "identified_only",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <IdentifyUser />
      {children}
    </PHProvider>
  );
}

function PageviewTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthog || !pathname) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [posthog, pathname, searchParams]);

  return null;
}

function IdentifyUser() {
  const posthog = usePostHog();
  const me = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (!posthog) return;
    if (me === undefined) return;
    if (me === null) {
      posthog.reset();
      return;
    }
    posthog.identify(me._id, {
      email: me.email ?? undefined,
      name: me.name ?? undefined,
    });
  }, [posthog, me]);

  return null;
}
