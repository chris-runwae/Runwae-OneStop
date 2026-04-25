import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Password({
      profile(params) {
        return {
          email: params.email as string,
          ...(params.name !== undefined ? { name: params.name as string } : {}),
        };
      },
    }),
  ],
  callbacks: {
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
