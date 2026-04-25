import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // existingUserId is non-null on subsequent sign-ins — keep the row as-is.
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // First sign-in (sign-up): insert the user row with default profile fields.
      const now = Date.now();
      const profile = args.profile as {
        email?: string;
        name?: string;
        image?: string;
      };

      return await ctx.db.insert("users", {
        email: profile.email,
        name: profile.name,
        image: profile.image,
        plan: "free",
        isHost: false,
        isAdmin: false,
        preferredCurrency: "GBP",
        onboardingComplete: false,
        createdAt: now,
      });
    },
  },
});
