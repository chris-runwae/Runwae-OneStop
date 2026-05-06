"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { AdminSidebar } from "@/components/layout/sidebar";
import { AdminHeader } from "@/components/layout/header";
import { Button } from "@runwae/ui/components/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const { signOut } = useAuthActions();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/sign-in");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || viewer === undefined) {
    return null;
  }

  if (viewer === null || viewer.isAdmin !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Forbidden</h1>
          <p className="text-sm text-muted-foreground">
            This account is not an admin. Sign in with a different Google
            account, or ask another admin to promote you.
          </p>
          {viewer?.email && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Signed in as <span className="font-mono">{viewer.email}</span>
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const user = {
    name: viewer.name ?? undefined,
    email: viewer.email ?? undefined,
  };

  return (
    <div className="flex min-h-screen bg-page">
      <AdminSidebar user={user} />
      <div className="ml-64 flex flex-1 min-w-0 flex-col">
        <AdminHeader user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
