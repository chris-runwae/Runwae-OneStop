// Design tokens are sourced from packages/ui/tokens.ts so the mobile
// app and apps/web speak the same colour vocabulary. Tokens whose
// canonical value is an HSL string are converted to the literal hex
// approximation here because NativeWind doesn't evaluate HSL syntax
// at build time.
const tokens = require("@runwae/ui/tokens").tokens;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // hsla(327, 99%, 42%) → #D5088D when rendered exactly. The
        // mobile UI was calibrated to a slightly brighter shade
        // (#FF2E92) the design team picked for OLED legibility, so we
        // expose both: `primary` keeps the calibrated mobile value,
        // while `primary-canonical` matches packages/ui exactly so a
        // future ramp can switch over without a rebuild.
        primary: "#FF2E92",
        "primary-canonical": tokens.colors.primary,
        "muted-200": "#E9ECEF",
        muted: "#F8F9FA",
        "dark-bg": "#212529",
        "dark-seconndary": "#212529",
      },
    },
  },
  plugins: [],
};
