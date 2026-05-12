import { NextRequest, NextResponse } from "next/server";
import { flags } from "@/lib/flags";

const COOKIE_PREFIX = "rw_variant_";
const COOKIE_TTL_DAYS = 90;

const PATH_FLAGS: Record<string, ReadonlyArray<keyof typeof flags>> = {
  "/": ["home_hero"],
};

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const flagsForPath = PATH_FLAGS[path];
  if (!flagsForPath?.length) return NextResponse.next();

  const res = NextResponse.next();
  for (const key of flagsForPath) {
    const cookieName = `${COOKIE_PREFIX}${key}`;
    if (req.cookies.has(cookieName)) continue;
    const variants = flags[key] as readonly string[];
    const picked = variants[Math.floor(Math.random() * variants.length)];
    res.cookies.set(cookieName, picked, {
      maxAge: 60 * 60 * 24 * COOKIE_TTL_DAYS,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  matcher: ["/"],
};
