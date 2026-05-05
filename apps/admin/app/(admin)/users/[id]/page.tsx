"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { UserAdminPanel } from "@/components/users/user-admin-panel";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;
  const user = useQuery(api.admin.users.getById, { id: userId });
  const adminCount = useQuery(api.admin.users.adminCount, {});
  const viewer = useQuery(api.users.getCurrentUser, {});

  return (
    <div className="space-y-6 p-8">
      <div>
        <Link
          href="/users"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back to users
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {user ? (user.name ?? user.email ?? "Unnamed user") : "Loading…"}
        </h1>
      </div>
      {user === undefined ||
      adminCount === undefined ||
      viewer === undefined ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : user === null ? (
        <div className="rounded-md border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          User not found.
        </div>
      ) : (
        <UserAdminPanel
          user={user}
          adminCount={adminCount}
          isSelf={viewer?._id === user._id}
        />
      )}
    </div>
  );
}
