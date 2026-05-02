import { SplashClient } from "@/components/splash/SplashClient";

// Authed users are redirected to /home by middleware before this renders,
// so this page only ever shows the splash to unauthenticated visitors.
export default function RootPage() {
  return <SplashClient />;
}
