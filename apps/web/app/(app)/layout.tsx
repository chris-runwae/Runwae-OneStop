import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const viewer = await fetchAuthedQuery(api.users.getCurrentUser, {});
  if (viewer && viewer.deletedAt !== undefined) {
    redirect("/restore");
  }
  if (viewer && viewer.onboardingComplete !== true) {
    redirect("/sign-up");
  }
  return <AppShell>{children}</AppShell>;
}
