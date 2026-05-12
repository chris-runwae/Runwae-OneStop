import Link from "next/link";
import { Button } from "@runwae/ui/components/button";
import { Container } from "./container";
import { navLinks, site } from "@/lib/site";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Runwae
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`${site.appUrl}/sign-in`}
            className="hidden text-sm font-medium text-foreground/80 transition-colors hover:text-foreground sm:inline-flex"
          >
            Log In
          </Link>
          <Button asChild size="sm">
            <Link href={`${site.appUrl}/sign-up`}>Get Started</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-lg bg-primary text-primary-foreground ${className ?? ""}`}
      aria-hidden
    >
      <span className="font-display text-base font-bold leading-none">R</span>
    </span>
  );
}
