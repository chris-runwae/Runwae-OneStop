"use client";

import { ROUTES } from "@/app/routes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon, MenuIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Sidebar from "./_sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen font-sans">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-4 sm:px-6 sm:py-5 lg:px-10 lg:py-7">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-border-light hover:text-body focus:outline-none focus:ring-2 focus:ring-ring lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="size-5" aria-hidden />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <h1 className="min-w-0 truncate font-display text-lg font-bold text-black sm:text-xl">
              Welcome Admin 👋
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-border-light focus:outline-none focus:ring-2 focus:ring-ring lg:flex"
                  aria-label="Open account menu"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      JL
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="block truncate font-display text-sm font-semibold leading-5 text-heading">
                      James Lucy
                    </span>
                    <span className="block truncate text-xs leading-4 text-muted-foreground">
                      jameslucy@gmail.com
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                <DropdownMenuItem asChild>
                  <Link
                    href={ROUTES.host.settings}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <SettingsIcon className="size-4" aria-hidden />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={() => {}}
                >
                  <LogOutIcon className="size-4" aria-hidden />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto bg-page">{children}</main>
      </div>
    </div>
  );
}
