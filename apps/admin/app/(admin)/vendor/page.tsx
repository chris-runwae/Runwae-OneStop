import { Store } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@runwae/ui/components/card";

export default function VendorPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-heading">
          Vendor
        </h1>
        <p className="text-sm text-muted-foreground">
          Vendor partnerships dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="size-5 text-primary" />
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Vendor management is on the roadmap. Vendors will let third-party
          travel partners — hotels, transport, experiences — attach offers to
          Runwae events for a commission.
        </CardContent>
      </Card>
    </div>
  );
}
