export const tokens = {
  colors: {
    primary: "hsla(327, 99%, 42%, 1)",
    primaryForeground: "hsl(0, 0%, 98.5%)",
    background: "hsl(0, 0%, 96%)",
    foreground: "hsl(0, 0%, 14.5%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(0, 0%, 14.5%)",
    muted: "hsl(0, 0%, 97%)",
    mutedForeground: "hsla(208, 7%, 46%, 1)",
    border: "hsl(0, 0%, 92.2%)",
    input: "hsl(0, 0%, 92.2%)",
    ring: "hsl(0, 0%, 70.8%)",
    destructive: "hsl(0, 72%, 58%)",
    success: "hsl(142, 76%, 36%)",
    error: "hsl(0, 84%, 50%)",
    errorLight: "hsl(0, 84%, 97%)",
    dark: {
      background: "hsl(0, 0%, 14.5%)",
      foreground: "hsl(0, 0%, 98.5%)",
      card: "hsl(0, 0%, 20.5%)",
      muted: "hsl(0, 0%, 26.9%)",
      border: "hsl(0, 0%, 100% / 10%)",
      input: "hsl(0, 0%, 100% / 15%)",
    },
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.625rem",
    xl: "0.75rem",
    "2xl": "0.875rem",
    "3xl": "1rem",
    "4xl": "1.125rem",
  },
  fonts: {
    display: "var(--font-bricolage)",
    body: "var(--font-inter)",
  },
} as const;

export type Tokens = typeof tokens;
