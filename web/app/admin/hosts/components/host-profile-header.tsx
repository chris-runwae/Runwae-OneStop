import { Mail, Phone, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type HostDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Pending" | "Suspended";
  avatarUrl?: string;
};

const STATUS_STYLES: Record<HostDetail["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-rose-50 text-rose-600",
};

export function HostProfileHeader({
  host,
  onSuspend,
}: {
  host: HostDetail;
  onSuspend: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {host.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={host.avatarUrl}
            alt={host.name}
            className="size-16 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {host.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-black">{host.name}</h2>
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[host.status])}>
              {host.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5" /> {host.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> {host.phone}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSuspend}
          className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors"
        >
          <XCircle className="size-4" /> Suspend Host
        </button>
      </div>
    </div>
  );
}
