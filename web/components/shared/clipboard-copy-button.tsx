import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";
import { Check, Copy, Link } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const { isCopied, copy } = useCopy();

  return (
    <button
      onClick={() => copy(text)}
      className={cn(
        "group flex items-center gap-2 w-full max-w-sm",
        "bg-background border border-input rounded-md",
        "px-3 py-2 text-sm text-left",
        "hover:bg-accent hover:border-accent-foreground/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-colors duration-150",
        className,
      )}
    >
      <Link size={14} className="shrink-0 text-muted-foreground" />

      <span className="flex-1 truncate text-muted-foreground font-mono text-xs">
        {text}
      </span>

      <span className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        {isCopied ? (
          <>
            <Check size={13} className="text-green-700" />
            <span className="text-green-700">Copied</span>
          </>
        ) : (
          <>
            <Copy size={13} />
            <span>Copy</span>
          </>
        )}
      </span>
    </button>
  );
}
