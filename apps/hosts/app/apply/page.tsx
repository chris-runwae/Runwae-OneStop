"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@runwae/ui/components/button";
import { Input } from "@runwae/ui/components/input";
import { Label } from "@runwae/ui/components/label";
import { Textarea } from "@runwae/ui/components/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";

export default function ApplyToHostPage() {
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
  const apply = useMutation(api.users.applyForHost);

  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/sign-in");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (application) {
      setBio(application.bio ?? "");
      setCountry(application.payoutCountry ?? "");
    }
  }, [application]);

  useEffect(() => {
    if (viewer?.isHost === true) router.replace("/overview");
  }, [viewer, router]);

  if (
    isLoading ||
    !isAuthenticated ||
    viewer === undefined ||
    application === undefined
  ) {
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apply({ bio: bio.trim(), payoutCountry: country.trim() });
      toast.success("Application submitted — we'll be in touch.");
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Apply to host on Runwae
          </CardTitle>
          <CardDescription>
            Tell us a bit about yourself. We aim to review applications within
            48 hours.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bio">About you</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What kinds of events do you want to host?"
                className="min-h-[140px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Payout country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="GB, US, AU, …"
                maxLength={3}
                className="uppercase"
              />
            </div>
            {application?.status === "rejected" &&
              application.rejectionReason && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                  Previous review note: {application.rejectionReason}
                </div>
              )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? "Submitting…"
                : application
                  ? "Resubmit application"
                  : "Submit application"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
