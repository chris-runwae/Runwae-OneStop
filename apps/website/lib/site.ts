export const site = {
  name: "Runwae",
  tagline: "Plan Together. Book Together. Split the Cost.",
  description:
    "Runwae is the all-in-one app for groups — discover events, build itineraries, and handle payments without the chaos.",
  url: "https://www.runwae.io",
  appUrl: "https://app.runwae.io",
  email: "mo@runwae.io",
  phone: "+1 469 544 8447",
  appStore: {
    ios: "https://apps.apple.com/app/runwae",
    android: "https://play.google.com/store/apps/details?id=io.runwae",
  },
  social: {
    instagram: "https://instagram.com/runwae",
    twitter: "https://twitter.com/runwae",
    linkedin: "https://www.linkedin.com/company/runwae",
  },
} as const;

export const navLinks = [
  { label: "Company", href: "/about" },
  { label: "Hosts", href: "/hosts" },
  { label: "Partners", href: "/partners" },
  { label: "Blog", href: "/blog" },
] as const;

export const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How it Works", href: "/about#how-it-works" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "Group Planning", href: "/about#features" },
      { label: "One-stop App", href: "/about#features" },
    ],
  },
  {
    title: "Partner",
    links: [
      { label: "Travel Partner", href: "/partners" },
      { label: "Event Host", href: "/hosts" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", href: `mailto:${"mo@runwae.io"}` },
      { label: "Help Center", href: "/about#faq" },
      { label: "FAQs", href: "/about#faq" },
    ],
  },
] as const;
