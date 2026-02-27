"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "Search",
  "aria-label": ariaLabel = "Search",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative min-w-0 flex-1 max-w-xs sm:min-w-[180px]", className)}>
      <SearchIcon
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9"
        aria-label={ariaLabel}
      />
    </div>
  );
}
