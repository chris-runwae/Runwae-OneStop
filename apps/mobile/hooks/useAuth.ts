import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@runwae/convex/convex/_generated/api";
import type { Doc } from "@runwae/convex/convex/_generated/dataModel";
import * as Sentry from "@sentry/react-native";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

// Required so the in-app browser can hand the auth response back to the JS
// runtime. No-op on native, but documented to be called at module load.
WebBrowser.maybeCompleteAuthSession();

export type AuthMethod = "password" | "google" | "apple";

export interface User {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  role?: "admin" | "user";
  email_verified?: boolean;
}

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  hasSeenOnboarding: boolean;
  hasCompletedBoarding: boolean;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => Promise<void>;
  currentBoardingStep: number;

  // The last sign-in method this device used, hydrated from SecureStore.
  // Surfaces a "Last used" badge over the right button on the auth screens.
  lastAuthMethod: AuthMethod | null;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    userData: Partial<User>,
  ) => Promise<{ success: boolean; error?: string }>;
  // Two-step password reset: `resetPassword` mails the OTP, then
  // `confirmPasswordReset` consumes it together with the new password.
  resetPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  confirmPasswordReset: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  // Email-verification on sign-up. `signUp` triggers the email; the
  // user types the 8-digit OTP into `verifyEmail` which signs them in.
  verifyEmail: (
    email: string,
    code: string,
  ) => Promise<{ success: boolean; error?: string }>;

  completeOnboarding: () => Promise<void>;
  completeBoarding: () => Promise<void>;
  setCurrentBoardingStep: (step: number) => Promise<void>;

  initialize: () => Promise<void>;
}

const BOARDING_STORAGE_KEY = "@boarding_completed";
const ONBOARDING_STORAGE_KEY = "@onboarding_completed";
const CURRENT_BOARDING_STEP_KEY = "@current_boarding_step";
const WELCOME_MODAL_TRIGGER_KEY = "@show_welcome_modal";
const LAST_AUTH_METHOD_KEY = "@last_auth_method";

const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") return localStorage.getItem(key);
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`storage.getItem error for ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`storage.setItem error for ${key}:`, error);
    }
  },
};

function toAppUser(
  viewer: Doc<"users"> | null | undefined,
): User | null {
  if (!viewer) return null;
  return {
    id: viewer._id as unknown as string,
    email: viewer.email ?? "",
    full_name: viewer.name ?? "",
    username: viewer.username,
    avatar_url: viewer.avatarUrl ?? viewer.image,
    role: viewer.isAdmin ? "admin" : "user",
    email_verified: viewer.emailVerificationTime != null,
  };
}

// Convex Auth surfaces internal error class names like `InvalidAccountId`
// (raised both for "no such email" and "wrong password" — by design, to
// avoid leaking which is which). Map the small known set to user-readable
// copy and report anything else to Sentry so we can fix it.
function friendlyAuthError(
  err: unknown,
  context:
    | "signIn"
    | "signUp"
    | "reset"
    | "reset-verification"
    | "email-verification"
    | "google"
    | "apple"
    | "signOut"
    | "updateProfile",
): string {
  const raw =
    err instanceof Error
      ? err.message
      : err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message ?? "")
        : "";

  // Friendly copy keyed by stable substrings Convex Auth puts in the error.
  // We match on substring rather than equality because the upstream message
  // sometimes wraps the class name in a longer "Uncaught Error: …" prefix.
  const map: Array<{ match: RegExp; messages: Partial<Record<typeof context, string>> }> = [
    {
      match: /InvalidAccountId/i,
      messages: {
        signIn: "We couldn't find an account with those details. Check your email and password.",
        reset: "We couldn't find an account with that email.",
        "reset-verification": "That code is invalid or has expired. Request a new one.",
        "email-verification": "That code is invalid or has expired. Request a new one.",
      },
    },
    {
      match: /InvalidSecret|invalid.*password/i,
      messages: {
        signIn: "That password doesn't match. Try again or reset it below.",
      },
    },
    {
      match: /AccountAlreadyExists|already.*exist/i,
      messages: {
        signUp: "An account with that email already exists. Try signing in.",
      },
    },
    {
      match: /TooManyRequests|rate.?limit/i,
      messages: {
        signIn: "Too many attempts. Wait a moment and try again.",
        reset: "Too many requests. Wait a moment before trying again.",
        signUp: "Too many requests. Wait a moment before trying again.",
      },
    },
    {
      match: /Network|fetch|ECONN/i,
      messages: {
        signIn: "Network error. Check your connection and try again.",
        signUp: "Network error. Check your connection and try again.",
        reset: "Network error. Check your connection and try again.",
        "reset-verification": "Network error. Check your connection and try again.",
        "email-verification": "Network error. Check your connection and try again.",
        google: "Network error. Check your connection and try again.",
        apple: "Network error. Check your connection and try again.",
      },
    },
  ];

  for (const entry of map) {
    if (entry.match.test(raw)) {
      const friendly = entry.messages[context];
      if (friendly) return friendly;
    }
  }

  // Unknown error — capture it so we can write a friendly mapping next time.
  // Tag with `auth_context` to make these easy to filter in Sentry.
  Sentry.captureException(err, {
    tags: { auth_context: context },
    extra: { raw_message: raw },
  });

  // Default copy per context — never expose the raw class name to the user.
  const fallbackByContext: Record<typeof context, string> = {
    signIn: "Couldn't sign in. Try again.",
    signUp: "Couldn't create your account. Try again.",
    reset: "Couldn't send a reset code. Try again.",
    "reset-verification": "Couldn't reset your password. Try again.",
    "email-verification": "Couldn't verify that code. Try again.",
    google: "Google sign-in didn't complete. Try again.",
    apple: "Apple sign-in didn't complete. Try again.",
    signOut: "Couldn't sign you out. Try again.",
    updateProfile: "Couldn't update your profile. Try again.",
  };
  return fallbackByContext[context];
}

export function useAuth(): UseAuthReturn {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();

  const viewer = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const updateProfile = useMutation(api.users.updateProfile);

  // Local-only mobile UX state. Source of truth for these moves to
  // users.onboardingComplete in Phase 2.
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasCompletedBoarding, setHasCompletedBoarding] = useState(false);
  const [showWelcomeModal, setShowWelcomeModalState] = useState(false);
  const [currentBoardingStep, setCurrentBoardingStepState] = useState(1);
  const [boardingHydrated, setBoardingHydrated] = useState(false);
  const [lastAuthMethod, setLastAuthMethod] = useState<AuthMethod | null>(null);

  const rememberAuthMethod = useCallback(async (method: AuthMethod) => {
    setLastAuthMethod(method);
    await storage.setItem(LAST_AUTH_METHOD_KEY, method);
  }, []);

  const user = toAppUser(viewer ?? null);
  const isProfileComplete = !!user?.full_name;
  // Treat "still loading viewer" as loading so consumers don't render
  // an authed UI before they have user data.
  const isLoading =
    convexLoading ||
    (isAuthenticated && viewer === undefined) ||
    !boardingHydrated;

  const initialize = useCallback(async () => {
    const [seen, completed, step, modal, lastMethod] = await Promise.all([
      storage.getItem(ONBOARDING_STORAGE_KEY),
      storage.getItem(BOARDING_STORAGE_KEY),
      storage.getItem(CURRENT_BOARDING_STEP_KEY),
      storage.getItem(WELCOME_MODAL_TRIGGER_KEY),
      storage.getItem(LAST_AUTH_METHOD_KEY),
    ]);
    setHasSeenOnboarding(seen === "true");
    setHasCompletedBoarding(completed === "true");
    if (step) setCurrentBoardingStepState(parseInt(step, 10));
    setShowWelcomeModalState(modal === "true");
    if (lastMethod === "password" || lastMethod === "google" || lastMethod === "apple") {
      setLastAuthMethod(lastMethod);
    }
    setBoardingHydrated(true);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // After successful auth we know the user has at minimum seen onboarding;
  // mirror that to local storage so route guards stop bouncing them back.
  useEffect(() => {
    if (isAuthenticated && !hasSeenOnboarding) {
      setHasSeenOnboarding(true);
      void storage.setItem(ONBOARDING_STORAGE_KEY, "true");
    }
  }, [isAuthenticated, hasSeenOnboarding]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        await convexSignIn("password", { email, password, flow: "signIn" });
        await rememberAuthMethod("password");
        return { success: true };
      } catch (err) {
        return { success: false, error: friendlyAuthError(err, "signIn") };
      }
    },
    [convexSignIn, rememberAuthMethod],
  );

  // OAuth redirect for the post-OAuth hand-off back into the app. iOS's
  // ASWebAuthenticationSession (used by WebBrowser.openAuthSessionAsync)
  // ONLY closes the in-app browser when the navigation matches a custom
  // URI scheme registered to this app — HTTPS redirects make the session
  // hang or dismiss immediately. Linking.createURL("auth-callback")
  // resolves to e.g. `runwae-dev://auth-callback` based on the variant
  // scheme in app.config.ts.
  //
  // NOTE: this is the redirect Convex Auth uses internally between the
  // OAuth provider's callback and the app. Google's own OAuth redirect
  // URI (set in Google Cloud Console) stays as the Convex HTTPS callback
  // — it never sees this scheme.
  const buildOAuthRedirect = useCallback(() => {
    return Linking.createURL("auth-callback");
  }, []);

  // Convex Auth's `signIn(provider)` on React Native returns a `redirect`
  // URL but does NOT open it for us — only the web SDK auto-redirects.
  // We open it ourselves via expo-web-browser, then feed the resulting
  // `code` back to convexSignIn to finish the handshake.
  const runOAuthFlow = useCallback(
    async (
      provider: "google" | "apple",
    ): Promise<{ success: boolean; error?: string; cancelled?: boolean }> => {
      const redirectTo = buildOAuthRedirect();
      const startResult = (await convexSignIn(provider as any, {
        redirectTo,
      })) as unknown as { redirect?: URL | string } | undefined;

      // If the SDK already completed the sign-in (rare on RN, common on web),
      // there's nothing else to do.
      if (!startResult?.redirect) {
        return { success: true };
      }

      const authorizeUrl =
        typeof startResult.redirect === "string"
          ? startResult.redirect
          : startResult.redirect.toString();

      const browserResult = await WebBrowser.openAuthSessionAsync(
        authorizeUrl,
        redirectTo,
      );

      if (browserResult.type === "cancel" || browserResult.type === "dismiss") {
        return { success: false, cancelled: true };
      }
      if (browserResult.type !== "success" || !browserResult.url) {
        return { success: false, error: "Sign-in didn't complete." };
      }

      const code = new URL(browserResult.url).searchParams.get("code");
      if (!code) {
        // Provider redirected without a code — usually means the user
        // declined or the provider config is wrong.
        return {
          success: false,
          error: "Provider didn't return an auth code.",
        };
      }

      await convexSignIn(provider as any, { code });
      return { success: true };
    },
    [convexSignIn, buildOAuthRedirect],
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      const r = await runOAuthFlow("google");
      if (r.cancelled) return { success: false, error: "Sign-in cancelled." };
      if (!r.success)
        return { success: false, error: r.error ?? "Google sign-in failed." };
      await rememberAuthMethod("google");
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: friendlyAuthError(err, "google"),
      };
    }
  }, [runOAuthFlow, rememberAuthMethod]);

  const signInWithApple = useCallback(async () => {
    // TODO(debug): remove these Sentry breadcrumbs once the sign-in
    // flow is verified end-to-end. Wrapped in a function so an
    // un-initialised Sentry can't blow up our auth flow.
    const breadcrumb = (step: string, data?: Record<string, unknown>) => {
      try {
        Sentry.addBreadcrumb({
          category: "auth.apple",
          message: step,
          level: "info",
          data,
        });
        Sentry.captureMessage(`apple-signin/${step}`, {
          level: "info",
          tags: { auth_method: "apple", step },
        });
      } catch {
        // never let observability break the flow
      }
    };

    breadcrumb("00-start");
    try {
      // Native iOS sheet. The Apple button is iOS-only (SocialAuthButtons.tsx
      // gates on Platform.OS === "ios"), so we don't need a web fallback here.
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      breadcrumb("10-sheet-returned", {
        hasIdentityToken: !!credential.identityToken,
        hasEmail: !!credential.email,
      });

      if (!credential.identityToken) {
        breadcrumb("11-no-identity-token");
        return {
          success: false,
          error: "Apple didn't return an identity token.",
        };
      }

      // The "apple-native" provider is a ConvexCredentials provider in
      // packages/convex/convex/lib/appleNative.ts that validates the JWT
      // against Apple's JWKS, then finds-or-creates the user. The OIDC
      // "apple" provider is reserved for web OAuth — it cannot accept
      // an identity token directly.
      breadcrumb("20-before-convex-signin");
      await convexSignIn("apple-native", {
        identityToken: credential.identityToken,
      });
      breadcrumb("30-after-convex-signin");
      await rememberAuthMethod("apple");
      breadcrumb("40-after-remember-method");

      // Sizing signal for "Hide My Email" duplicate-account risk: Apple
      // only returns credential.email on the FIRST sign-in for a given
      // user; if that email is a privaterelay address, we cannot link
      // them to any existing password account with the same real email,
      // so they get a fresh user row. Counting these tells us how big
      // the account-linking problem is before we invest in a fix.
      if (credential.email?.endsWith("@privaterelay.appleid.com")) {
        Sentry.captureMessage("apple-signin-relay-email", {
          level: "info",
          tags: { auth_method: "apple", email_type: "relay" },
        });
      }

      return { success: true };
    } catch (err) {
      // ERR_REQUEST_CANCELED is what expo-apple-authentication throws when
      // the user dismisses the sheet. Surface that as a cancellation, not
      // an error toast.
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "ERR_REQUEST_CANCELED"
      ) {
        return { success: false, error: "Sign-in cancelled." };
      }
      return {
        success: false,
        error: friendlyAuthError(err, "apple"),
      };
    }
  }, [convexSignIn, rememberAuthMethod]);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        await convexSignIn("password", {
          email,
          password,
          flow: "signUp",
          ...(fullName ? { name: fullName } : {}),
        });
        // New user: reset boarding flags so the 5-step flow runs.
        await Promise.all([
          storage.setItem(BOARDING_STORAGE_KEY, "false"),
          storage.setItem(CURRENT_BOARDING_STEP_KEY, "1"),
          storage.setItem(WELCOME_MODAL_TRIGGER_KEY, "false"),
        ]);
        setHasCompletedBoarding(false);
        setCurrentBoardingStepState(1);
        setShowWelcomeModalState(false);
        await rememberAuthMethod("password");
        return { success: true };
      } catch (err) {
        return { success: false, error: friendlyAuthError(err, "signUp") };
      }
    },
    [convexSignIn, rememberAuthMethod],
  );

  const signOut = useCallback(async () => {
    try {
      await convexSignOut();
      // Clear local UX state so a different user signing in next gets a clean slate.
      // Note: lastAuthMethod is intentionally preserved so the next sign-in
      // screen can still show "Last used" for this device.
      await Promise.all([
        storage.setItem(BOARDING_STORAGE_KEY, "false"),
        storage.setItem(ONBOARDING_STORAGE_KEY, "false"),
        storage.setItem(CURRENT_BOARDING_STEP_KEY, "1"),
        storage.setItem(WELCOME_MODAL_TRIGGER_KEY, "false"),
      ]);
      setHasCompletedBoarding(false);
      setHasSeenOnboarding(false);
      setCurrentBoardingStepState(1);
      setShowWelcomeModalState(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyAuthError(err, "signOut") };
    }
  }, [convexSignOut]);

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      try {
        await updateProfile({
          ...(userData.full_name !== undefined
            ? { name: userData.full_name }
            : {}),
          ...(userData.avatar_url !== undefined
            ? { avatarUrl: userData.avatar_url }
            : {}),
        });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: friendlyAuthError(err, "updateProfile"),
        };
      }
    },
    [updateProfile],
  );

  // Password reset is a two-step OTP flow: requesting the reset mails
  // an 8-digit code; submitting that code with a new password rotates
  // the credential. Convex Auth keys the request on `flow: "reset"` and
  // the confirm on `flow: "reset-verification"`.
  const resetPassword = useCallback(
    async (email: string) => {
      try {
        await convexSignIn("password", { email, flow: "reset" });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: friendlyAuthError(err, "reset"),
        };
      }
    },
    [convexSignIn],
  );

  const confirmPasswordReset = useCallback(
    async (email: string, code: string, newPassword: string) => {
      try {
        await convexSignIn("password", {
          email,
          code,
          newPassword,
          flow: "reset-verification",
        });
        await rememberAuthMethod("password");
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: friendlyAuthError(err, "reset-verification"),
        };
      }
    },
    [convexSignIn, rememberAuthMethod],
  );

  // Updating the password while logged in routes through the same
  // reset flow against the viewer's own email; @convex-dev/auth doesn't
  // expose a separate "change password" verb. Callers should prompt
  // the user for the OTP they just received before calling this.
  const updatePassword = useCallback(async (_newPassword: string) => {
    return {
      success: false,
      error:
        "Use Settings → Reset password to change your password from this device.",
    };
  }, []);

  // Sign-up email verification. The `signUp` flow triggers the OTP
  // mail; the user enters the code here to complete provisioning.
  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      try {
        await convexSignIn("password", {
          email,
          code,
          flow: "email-verification",
        });
        await rememberAuthMethod("password");
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: friendlyAuthError(err, "email-verification"),
        };
      }
    },
    [convexSignIn, rememberAuthMethod],
  );

  const completeOnboarding = useCallback(async () => {
    setHasSeenOnboarding(true);
    await storage.setItem(ONBOARDING_STORAGE_KEY, "true");
  }, []);

  const completeBoarding = useCallback(async () => {
    setHasCompletedBoarding(true);
    setShowWelcomeModalState(true);
    await Promise.all([
      storage.setItem(BOARDING_STORAGE_KEY, "true"),
      storage.setItem(WELCOME_MODAL_TRIGGER_KEY, "true"),
    ]);
  }, []);

  const setCurrentBoardingStep = useCallback(async (step: number) => {
    setCurrentBoardingStepState(step);
    await storage.setItem(CURRENT_BOARDING_STEP_KEY, step.toString());
  }, []);

  const setShowWelcomeModal = useCallback(async (show: boolean) => {
    setShowWelcomeModalState(show);
    await storage.setItem(WELCOME_MODAL_TRIGGER_KEY, show.toString());
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    hasSeenOnboarding,
    hasCompletedBoarding,
    showWelcomeModal,
    setShowWelcomeModal,
    currentBoardingStep,
    lastAuthMethod,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signUp,
    signOut,
    updateUser,
    resetPassword,
    confirmPasswordReset,
    updatePassword,
    verifyEmail,
    completeOnboarding,
    completeBoarding,
    setCurrentBoardingStep,
    initialize,
  };
}
