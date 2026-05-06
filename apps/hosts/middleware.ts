import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
]);
const isUploadthingRoute = createRouteMatcher(["/api/uploadthing(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isUploadthingRoute(request)) return;

  const authed = await convexAuth.isAuthenticated();

  if (!isAuthRoute(request) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search
    )}`;
    return NextResponse.redirect(url);
  }

  if (isAuthRoute(request) && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
