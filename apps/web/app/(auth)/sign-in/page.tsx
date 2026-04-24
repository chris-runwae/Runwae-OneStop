import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to Runwae</p>
      </div>
      {/* Auth form goes here */}
    </div>
  );
}
