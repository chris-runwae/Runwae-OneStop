"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@runwae/ui/components/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform configuration and admin team management.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <StubCard
            title="General"
            description="Platform name, contact email, default currency."
          />
        </TabsContent>
        <TabsContent value="team">
          <StubCard
            title="Team"
            description="Promote / demote admins. Today this is done from /users — pull-up coming."
          />
        </TabsContent>
        <TabsContent value="payments">
          <StubCard
            title="Payments"
            description="Stripe connection status and payout method defaults."
          />
        </TabsContent>
        <TabsContent value="subscription">
          <StubCard
            title="Subscription"
            description="Pro plan billing for the platform itself."
          />
        </TabsContent>
        <TabsContent value="commission">
          <StubCard
            title="Commission"
            description="Default commission split percentages applied to new events."
          />
        </TabsContent>
        <TabsContent value="security">
          <StubCard
            title="Security"
            description="Audit log viewer (admin_audit_log) — coming soon."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StubCard({
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
        This panel is stubbed. Wire it up in a follow-up — the underlying
        Convex pieces (admin/users, admin/events, audit log) are already in
        place.
      </CardContent>
    </Card>
  );
}
