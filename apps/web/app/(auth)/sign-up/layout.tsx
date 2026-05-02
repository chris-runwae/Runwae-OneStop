import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";

export default async function SignUpLayout({ children }: { children: ReactNode }) {
  const viewer = await fetchAuthedQuery(api.users.getCurrentUser, {});
  if (viewer?.onboardingComplete === true) {
    redirect("/home");
  }
  return <>{children}</>;
}
