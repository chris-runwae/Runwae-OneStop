import Link from "next/link";
import { Container } from "./container";
import { footerSections, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.5fr_2fr]">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-display text-base font-bold leading-none">
                R
              </span>
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              {site.name}
            </span>
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            {site.description}
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <a
                href={`mailto:${site.email}`}
                className="hover:text-foreground"
              >
                {site.email}
              </a>
            </p>
            <p>
              <a
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
                className="hover:text-foreground"
              >
                {site.phone}
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <SocialLink href={site.social.instagram} label="Instagram">
              <InstagramIcon />
            </SocialLink>
            <SocialLink href={site.social.twitter} label="Twitter">
              <TwitterIcon />
            </SocialLink>
            <SocialLink href={site.social.linkedin} label="LinkedIn">
              <LinkedInIcon />
            </SocialLink>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <div className="border-t border-border/60">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Runwae, Inc.</p>
          <p>The future of travel.</p>
        </Container>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-foreground/70 transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </Link>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-.5a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M18.244 2H21l-6.5 7.43L22 22h-6.49l-4.66-6.1L5.5 22H3l7-7.99L2 2h6.59l4.21 5.55L18.244 2zm-2.27 18h1.78L7.06 4H5.2L15.974 20z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 11.001 5 2.5 2.5 0 010-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.84-2.05 3.8-2.05 4.07 0 4.82 2.68 4.82 6.16V21h-4v-5.5c0-1.32-.02-3.02-1.84-3.02-1.84 0-2.13 1.44-2.13 2.93V21h-4V9z" />
    </svg>
  );
}
