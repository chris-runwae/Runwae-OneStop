"use client";

import { ROUTES } from "@/app/routes";
import { useAuth } from "@/context/AuthContext";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const settingsRow =
  "flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5";

export default function AccountSettingsTab() {
  const router = useRouter();
  const { user, signOut, isSigningOut } = useAuth();

  const isEmailVerified = !!user?.email_confirmed_at;

  const handleChangePassword = () => {
    router.push(ROUTES.forgotPassword);
  };

  const handleLogout = async () => {
    await signOut();
    router.push(ROUTES.login);
  };

  const handleDeleteAccount = () => {
    toast.error("Please contact support to delete your account");
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-black sm:text-2xl">
          Account Settings
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Manage your account and sign-in options.
        </p>
      </div>

      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
        <div className="border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="font-display text-base font-semibold text-heading">
            Account Settings
          </h3>
        </div>

        <div className={`${settingsRow} border-b border-border`}>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-heading">
              Verify Email Address
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              Verify your email to keep your account secure
            </p>
          </div>
          <div className="mt-2 shrink-0 sm:mt-0">
            {isEmailVerified ? (
              <span className="inline-flex items-center rounded-lg bg-success/15 px-3 py-2 text-sm font-semibold text-success">
                Verified!
              </span>
            ) : (
              <span className="inline-flex items-center rounded-lg bg-warning/15 px-3 py-2 text-sm font-semibold text-warning">
                Not Verified
              </span>
            )}
          </div>
        </div>

        <div className={`${settingsRow} border-b border-border`}>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-heading">
              Change Password
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              Update your password to keep your account secure
            </p>
          </div>
          <div className="mt-2 shrink-0 sm:mt-0">
            <button
              type="button"
              onClick={handleChangePassword}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-border-light focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Change Password
            </button>
          </div>
        </div>

        <div className={`${settingsRow} border-b border-border`}>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-heading">
              Logout
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              Sign out of your account on this device
            </p>
          </div>
          <div className="mt-2 shrink-0 sm:mt-0">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-border-light focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <LogOutIcon className="size-4" aria-hidden />
              {isSigningOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>

        <div className={settingsRow}>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-heading">
              Delete Account
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <div className="mt-2 shrink-0 sm:mt-0">
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="rounded-lg bg-destructive/15 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/25 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
