"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@runwae/ui/components/tabs";
import { Input } from "@runwae/ui/components/input";
import { Label } from "@runwae/ui/components/label";
import { Button } from "@runwae/ui/components/button";

export default function HostSettingsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Account, payments, preferences.
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="payment">
          <Stub
            title="Payment"
            description="Connect a Stripe account to receive payouts. (Coming soon — wire to Stripe Connect.)"
          />
        </TabsContent>
        <TabsContent value="notifications">
          <Stub
            title="Notifications"
            description="Email and in-app notification preferences."
          />
        </TabsContent>
        <TabsContent value="preferences">
          <Stub
            title="Preferences"
            description="Default currency, timezone, language."
          />
        </TabsContent>
        <TabsContent value="security">
          <Stub
            title="Security"
            description="Password change, two-factor authentication."
          />
        </TabsContent>
        <TabsContent value="activity">
          <Stub
            title="Activity"
            description="Recent sessions and security events."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AccountTab() {
  const viewer = useQuery(api.users.getCurrentUser, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (viewer?.name) setName(viewer.name);
  }, [viewer]);

  async function onSave() {
    setSubmitting(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>How others see your profile on Runwae.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={viewer?.email ?? ""} disabled />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={onSave} disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function Stub({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Wire up in a follow-up.
      </CardContent>
    </Card>
  );
}
