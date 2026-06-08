/**
 * Native Apple Sign-In credentials provider for Convex Auth.
 *
 * @auth/core's Apple provider is OIDC-only — it handles the OAuth
 * redirect-and-code-exchange flow used by web apps. iOS native sign-in is
 * different: AuthenticationServices on-device hands the app a signed
 * identity token directly, with no code exchange. We validate that JWT
 * server-side against Apple's published JWKS and create / retrieve the
 * user without ever touching Apple's token endpoint.
 *
 * Client usage:
 * ```ts
 *   await signIn("apple-native", { identityToken: credential.identityToken });
 * ```
 *
 * Required env vars:
 *   AUTH_APPLE_AUDIENCES — comma-separated list of iOS bundle IDs that may
 *     produce identity tokens we accept. Typically:
 *       "app.runwae.io,app.runwae.preview,app.runwae.dev"
 *     Falls back to AUTH_APPLE_ID for single-audience deployments.
 */

import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

// JWKS is cached in module scope; jose's createRemoteJWKSet handles
// background refresh + key rotation per Apple's Cache-Control headers.
const appleJWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);

const APPLE_ISSUER = "https://appleid.apple.com";

function allowedAudiences(): string[] {
  const fromList = (process.env.AUTH_APPLE_AUDIENCES ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (fromList.length > 0) return fromList;
  const single = process.env.AUTH_APPLE_ID;
  if (single) return [single];
  // No audiences configured — fail closed.
  return [];
}

interface AppleClaims {
  sub: string;
  email?: string;
  email_verified?: boolean | "true" | "false";
  is_private_email?: boolean | "true" | "false";
}

function coerceBool(
  value: boolean | "true" | "false" | undefined,
): boolean {
  if (value === true || value === "true") return true;
  return false;
}

/**
 * Provider id is the second arg you pass to signIn(): signIn("apple-native", {...}).
 * Keeping it distinct from "apple" (the OIDC provider) means web Apple sign-in
 * can keep using the OIDC flow without conflict.
 */
export const AppleNative = ConvexCredentials({
  id: "apple-native",
  authorize: async (credentials, ctx) => {
    const identityToken = credentials.identityToken;
    if (typeof identityToken !== "string" || identityToken.length === 0) {
      return null;
    }

    // Apple only sends the user's name on the FIRST authorization, so the
    // client forwards it alongside the token. It is never part of the signed
    // JWT — treat it as untrusted display text and only use it to seed the
    // profile on account creation (App Review Guideline 4: don't force the
    // user to re-enter the name Sign in with Apple already gave us).
    const appleFullName =
      typeof credentials.fullName === "string"
        ? credentials.fullName.trim()
        : "";

    const audiences = allowedAudiences();
    if (audiences.length === 0) {
      console.error(
        "[auth:apple-native] AUTH_APPLE_AUDIENCES / AUTH_APPLE_ID unset — refusing to validate.",
      );
      return null;
    }

    let claims: AppleClaims;
    try {
      const { payload } = await jwtVerify(identityToken, appleJWKS, {
        issuer: APPLE_ISSUER,
        audience: audiences,
      });
      claims = payload as unknown as AppleClaims;
    } catch (err) {
      console.warn("[auth:apple-native] identity token validation failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }

    if (!claims.sub) {
      console.warn("[auth:apple-native] token missing sub claim");
      return null;
    }

    // First, look up an existing apple-native account. On every sign-in
    // after the first, this is the path that hits.
    //
    // retrieveAccount's @returns docstring claims it returns `null` when
    // no account exists, but the actual implementation throws an Error
    // with message "InvalidAccountId" instead. Catch that case and treat
    // it as "no account → fall through to createAccount". Any other
    // error rethrows.
    let existing: Awaited<ReturnType<typeof retrieveAccount>> | null = null;
    try {
      existing = await retrieveAccount(ctx, {
        provider: "apple-native",
        account: { id: claims.sub },
      });
    } catch (err) {
      if (!(err instanceof Error && err.message === "InvalidAccountId")) {
        throw err;
      }
    }
    if (existing) {
      return { userId: existing.user._id };
    }

    // No existing account. Create one, and link to an existing user with
    // the same verified email if Apple shared the user's real email.
    // shouldLinkViaEmail is safe here only because Apple verifies emails
    // before issuing tokens (email_verified === true).
    const emailVerified = coerceBool(claims.email_verified);
    const shouldLinkViaEmail =
      emailVerified &&
      typeof claims.email === "string" &&
      // Don't link relay addresses to anything — they're per-Apple-ID,
      // so linking by relay address would only match other Apple sign-ins
      // for the same person, which the sub-lookup above already handles.
      !claims.email.endsWith("@privaterelay.appleid.com");

    const { user } = await createAccount(ctx, {
      provider: "apple-native",
      account: { id: claims.sub },
      profile: {
        ...(appleFullName ? { name: appleFullName } : {}),
        ...(claims.email ? { email: claims.email } : {}),
        // emailVerificationTime is the authTables field for verified email.
        // Apple's email_verified is trustworthy.
        ...(emailVerified && claims.email
          ? { emailVerificationTime: Date.now() }
          : {}),
      },
      shouldLinkViaEmail,
    });

    return { userId: user._id };
  },
});
