"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InviteAdminModal, EditRoleModal } from "../modals/team-modals";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Invited" | "Inactive";
};

const MOCK_ADMINS: AdminUser[] = [
  { id: "1", name: "Christopher Jones", email: "christopher@runwae.com", role: "Super Admin", status: "Active" },
  { id: "2", name: "Emmanualla James", email: "emm@runwae.com", role: "Moderator", status: "Active" },
  { id: "3", name: "Emmanualla James", email: "emm2@runwae.com", role: "Support Agent", status: "Invited" },
  { id: "4", name: "Fabian Adole", email: "fabian@runwae.com", role: "Finance", status: "Active" },
  { id: "5", name: "Taylor Ayfer", email: "taylor@runwae.com", role: "Read Only", status: "Active" },
  { id: "6", name: "Lin Logean", email: "lin@runwae.com", role: "Moderator", status: "Inactive" },
];

const STATUS_STYLES: Record<AdminUser["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Invited: "bg-amber-50 text-amber-700",
  Inactive: "bg-gray-100 text-gray-500",
};

export function TeamTab() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | undefined>();

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-black">Admin Users</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Manage admin accounts and their permissions.</p>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Invite Admin
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Admin", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ADMINS.map((admin) => (
                <tr key={admin.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {admin.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-body">{admin.role}</td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[admin.status])}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditAdmin(admin); setEditOpen(true); }}
                        className="text-muted-foreground hover:text-black transition-colors"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button type="button" className="text-muted-foreground hover:text-rose-500 transition-colors">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InviteAdminModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <EditRoleModal open={editOpen} onClose={() => setEditOpen(false)} admin={editAdmin} />
    </>
  );
}
