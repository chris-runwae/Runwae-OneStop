import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isSignInRoute = createRouteMatcher(["/sign-in(.*)"]);

// /api/uploadthing must bypass auth redirects entirely. Two reasons:
//   1. UploadThing's edge POSTs the upload-completion callback with no
//      auth cookie — a 307 to /sign-in makes the browser XHR poll forever.
//   2. The dropzone's mount-time config GET runs as the authed admin; if
//      the route is "public" the second middleware branch redirects them
//      to /, so the JSON config never arrives and the button stays
//      stuck in a loading state.
// The route's own auth gate (core.ts → requireAdminViewer) still rejects
// non-admins; UploadThing's callback is verified by signed payload.
const isUploadthingRoute = createRouteMatcher(["/api/uploadthing(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isUploadthingRoute(request)) return;

  const authed = await convexAuth.isAuthenticated();

  if (!isSignInRoute(request) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search
    )}`;
    return NextResponse.redirect(url);
  }

  if (isSignInRoute(request) && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
