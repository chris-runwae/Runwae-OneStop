"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";
import Sidebar from "./_sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen font-sans">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

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
          <h1 className="min-w-0 truncate font-display text-lg font-bold text-black sm:text-xl">
            Welcome Admin 👋
          </h1>
        </header>

        <main className="min-h-0 flex-1 overflow-auto bg-page">
          {children}
        </main>
      </div>
    </div>
  );
}
