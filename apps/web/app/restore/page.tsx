import { redirect } from "next/navigation";
import { fetchAuthedQuery } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { RestoreAccountCard } from "./RestoreAccountCard";

export default async function RestorePage() {
  const viewer = await fetchAuthedQuery(api.users.getCurrentUser, {});

  // Not signed in — middleware should have caught this, but be defensive.
  if (!viewer) redirect("/sign-in");

  // Not actually pending deletion — bounce home so the URL doesn't get stuck.
  if (viewer.deletedAt === undefined) redirect("/home");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <RestoreAccountCard
        deletedAt={viewer.deletedAt}
        deletionScheduledFor={viewer.deletionScheduledFor}
      />
    </main>
  );
}
