import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/t/(.*)",
  "/e/(.*)",
  "/d/(.*)",
]);

// Routes that an already-signed-in user should never sit on. After Google
// OAuth, Convex redirects back to SITE_URL (the splash) — bouncing those users
// straight to /home in the middleware avoids waiting on a client-side redirect.
// /sign-up is excluded because it has its own onboarding-aware redirect logic.
const isAuthEntryRoute = createRouteMatcher(["/", "/sign-in(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authed = await convexAuth.isAuthenticated();

  if (isAuthEntryRoute(request) && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!isPublicRoute(request) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search
    )}`;
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
