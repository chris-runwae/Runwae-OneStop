import { HostsStats } from "./components/hosts-stats";
import { HostsTable } from "./components/hosts-table";

export default function AdminHostsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-black">Hosts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage Event Hosts and their activities.</p>
      </div>
      <HostsStats />
      <HostsTable />
    </div>
  );
}
