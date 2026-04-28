"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface TabBarProps {
  children: ReactNode;
  variant?: "main" | "pill";
  className?: string;
}

interface TabBarItemProps {
  href: string;
  icon?: ReactNode;
  label: string;
  className?: string;
}

export function TabBar({ children, variant = "main", className }: TabBarProps) {
  return (
    <nav
      className={cn(
        "flex",
        variant === "main"
          ? "fixed bottom-0 left-0 right-0 justify-around border-t border-border bg-card pt-2 pb-6"
          : "gap-1 rounded-full bg-muted p-1",
        className
      )}
    >
      {children}
    </nav>
  );
}

export function TabBarItem({ href, icon, label, className }: TabBarItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
