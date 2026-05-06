"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { HostSidebar } from "@/components/layout/host-sidebar";
import { HostHeader } from "@/components/layout/host-header";
import { Button } from "@runwae/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";

export default function HostLayout({
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
  const application = useQuery(
    api.users.getMyHostApplication,
    isAuthenticated ? {} : "skip"
  );
  const { signOut } = useAuthActions();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/sign-in");
  }, [isLoading, isAuthenticated, router]);

  if (
    isLoading ||
    !isAuthenticated ||
    viewer === undefined ||
    application === undefined
  ) {
    return null;
  }

  if (viewer === null) return null;

  if (viewer.isHost !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {application?.status === "pending"
                ? "Application pending"
                : application?.status === "rejected"
                  ? "Application rejected"
                  : "Become a Runwae host"}
            </CardTitle>
            <CardDescription>
              {application?.status === "pending" &&
                "We're reviewing your application — you'll get an email when it's approved."}
              {application?.status === "rejected" &&
                (application.rejectionReason ??
                  "Your application was not approved. You can resubmit at any time.")}
              {!application &&
                "Apply to host events on Runwae. Approval is usually within 48 hours."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {viewer.email && (
              <p className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
                Signed in as <span className="font-mono">{viewer.email}</span>
              </p>
            )}
            <Button asChild className="w-full">
              <Link href="/apply">
                {application?.status === "rejected"
                  ? "Resubmit application"
                  : application?.status === "pending"
                    ? "Edit application"
                    : "Start application"}
              </Link>
            </Button>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => signOut()}
            >
              Sign out
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const user = {
    name: viewer.name ?? undefined,
    email: viewer.email ?? undefined,
  };

  return (
    <div className="flex min-h-screen bg-page">
      <HostSidebar user={user} />
      <div className="ml-64 flex flex-1 min-w-0 flex-col">
        <HostHeader user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
