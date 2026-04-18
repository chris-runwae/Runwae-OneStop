"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SettingsToggle } from "../components/settings-toggle";

function ModalShell({ title, open, onClose, children }: {
  title: string; open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-black">{title}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-black transition-colors">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Invite Admin ─── */
export function InviteAdminModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell title="Invite Admin" open={open} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">Send an invitation to a new admin user.</p>
      <div className="flex flex-col gap-3">
        <Field label="Full Name" placeholder="e.g. John Doe" />
        <Field label="Email Address" placeholder="admin@runwae.com" type="email" />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Role</label>
          <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-body focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50">
            {["Super Admin", "Moderator", "Support Agent", "Finance", "Read Only"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
      >
        Send Invite
      </button>
    </ModalShell>
  );
}

/* ─── Edit Admin Role ─── */
const PERMISSIONS = [
  "Manage Hosts",
  "Manage Vendors",
  "Manage Events",
  "Manage Bookings",
  "Issue Refunds",
  "View Analytics",
  "Manage Settings",
  "Manage Admins",
];

export function EditRoleModal({ open, onClose, admin }: {
  open: boolean;
  onClose: () => void;
  admin?: { name: string; role: string };
}) {
  const [role, setRole] = useState(admin?.role ?? "Moderator");
  const [perms, setPerms] = useState<Record<string, boolean>>(
    Object.fromEntries(PERMISSIONS.map((p) => [p, ["Manage Hosts", "Manage Events", "View Analytics"].includes(p)])),
  );

  const togglePerm = (p: string) => setPerms((prev) => ({ ...prev, [p]: !prev[p] }));

  return (
    <ModalShell title="Edit Admin Role" open={open} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <Field label="Name" placeholder="Full name" defaultValue={admin?.name} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-body">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-body focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {["Super Admin", "Moderator", "Support Agent", "Finance", "Read Only"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-body">Permissions</label>
          {PERMISSIONS.map((p) => (
            <div key={p} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm text-black">{p}</span>
              <SettingsToggle size="sm" checked={perms[p]} onChange={() => togglePerm(p)} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-body hover:bg-muted/40 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>
    </ModalShell>
  );
}

function Field({ label, placeholder, type = "text", defaultValue }: {
  label: string; placeholder: string; type?: string; defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-body">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
    </div>
  );
}
