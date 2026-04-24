import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground">Join Runwae</p>
      </div>
      {/* Auth form goes here */}
    </div>
  );
}
