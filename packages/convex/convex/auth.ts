import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { buildCandidate } from "./lib/username";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
} from "./lib/email";

const ALLOWED_ORIGINS = (process.env.ALLOWED_REDIRECT_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// 8-digit numeric OTP. Short enough to type on mobile, long enough to
// survive the rate-limit budget Convex Auth bakes in. We avoid lookalikes
// (0/O, 1/I) by sticking to digits only.
function generateNumericOtp(length = 8) {
  let out = "";
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10);
  return out;
}

// `Email` factories must each have a unique `id` so Convex Auth can route
// the right verifier to the right flow ("reset" → ResetOTP, password sign-up
// verification → VerifyOTP).
const ResetOTP = Email({
  id: "password-reset-otp",
  maxAge: 60 * 15, // 15 minutes
  generateVerificationToken: () => generateNumericOtp(8),
  async sendVerificationRequest({ identifier, token }) {
    await sendPasswordResetEmail({ email: identifier, token });
  },
});

const VerifyOTP = Email({
  id: "email-verification-otp",
  maxAge: 60 * 15,
  generateVerificationToken: () => generateNumericOtp(8),
  async sendVerificationRequest({ identifier, token }) {
    await sendEmailVerification({ email: identifier, token });
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      authorization: {
        params: {
          // Force Google account chooser instead of silently reusing
          // an existing Google session in the browser.
          prompt: "select_account",
        },
      },
    }),
    Password({
      // Email-verification on sign-up: users must confirm an OTP before
      // their account is provisioned. Comment out `verify` to skip the
      // gate (e.g. internal test builds).
      verify: VerifyOTP,
      reset: ResetOTP,
      profile(params) {
        return {
          email: params.email as string,
          ...(params.name !== undefined ? { name: params.name as string } : {}),
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      const url = new URL(redirectTo);
      const origin = `${url.protocol}//${url.host}`;
      if (ALLOWED_ORIGINS.includes(origin)) return redirectTo;
      throw new Error(`Redirect to ${redirectTo} not allowed`);
    },
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const profile = args.profile as {
        email?: string;
        name?: string;
        image?: string;
      };

      // If a users row already exists for this email (e.g., a previous sign-up
      // attempt populated it), reuse it instead of inserting a duplicate —
      // a duplicate row would orphan the new account from the existing user.
      if (profile.email) {
        const existing = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), profile.email))
          .first();
        if (existing) return existing._id;
      }

      // Auto-generate a unique username. Up to 6 attempts: first try a clean
      // sanitized base, then append random suffixes.
      // NOTE: the auth callback's ctx is typed against the auth library's
      // minimal schema and doesn't see our app-level indexes (`by_username`),
      // so we collision-check via filter rather than withIndex.
      const base = profile.name ?? profile.email?.split("@")[0] ?? "user";
      let username: string | undefined;
      for (let attempt = 0; attempt < 6; attempt++) {
        const candidate = buildCandidate(base, attempt);
        const collision = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("username"), candidate))
          .first();
        if (!collision) {
          username = candidate;
          break;
        }
      }

      try {
        return await ctx.db.insert("users", {
          email: profile.email,
          name: profile.name,
          image: profile.image,
          plan: "free",
          isHost: false,
          isAdmin: false,
          preferredCurrency: "GBP",
          onboardingComplete: false,
          username,
          createdAt: Date.now(),
        });
      } catch (err) {
        console.error("[auth:createOrUpdateUser] insert failed", {
          profile,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
  },
});
