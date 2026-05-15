# Smoke Test — Email Verification (sign-up OTP)

Rerun this checklist before every release where `packages/convex/convex/auth.ts`,
`packages/convex/convex/lib/email.ts`, or the `Password` provider was touched.

## Prerequisites

- A dev build installed (`eas build --profile development` or local `expo run:ios`).
- A throwaway email you can read in real time (any catch-all inbox works).
- `AUTH_RESEND_API_KEY` is set in the Convex dashboard for the target deployment.

## Steps

1. **Fresh sign-up**
   - Open the dev build, tap "Sign up", enter the throwaway email + a fresh
     password.
   - Expected: app navigates to the OTP-entry screen.
   - Expected: `packages/convex/convex/lib/email.ts → sendEmailVerification`
     fires; check Resend dashboard or Convex logs for "verification token sent".

2. **OTP arrives**
   - Within 30 seconds the inbox receives a Runwae verification email.
   - The body contains an 8-digit numeric code (`generateNumericOtp(8)` from
     `auth.ts:80`).

3. **Correct OTP accepts**
   - Paste the OTP into the dev build.
   - Expected: app advances to onboarding; `users.emailVerificationTime` is
     set on the new row (verify in Convex dashboard).

4. **Replay rejected**
   - Sign out, sign back in with the same email, request a new OTP.
   - Enter the *previous* code from step 3.
   - Expected: visible error like "Invalid or expired code". The previous
     OTP must not unlock the new session.

5. **Wrong OTP rejected gracefully**
   - Trigger another OTP, type 8 random digits.
   - Expected: user-readable error text. Must **not** be "Internal Server
     Error", "Error 500", or an uncaught exception toast.

6. **Expiry**
   - Trigger an OTP, leave for >15 minutes (`maxAge: 60 * 15` in `auth.ts:79`).
   - Attempt to use it.
   - Expected: "Code expired, request a new one" or equivalent.

## Rollback

If any step fails, revert the most recent change to `auth.ts` /
`lib/email.ts` and re-run. The OTP flow is gated on Resend availability —
if Resend is down the failure mode should still be a user-readable error,
not a crash.

## Notes

- This is **manual**. We don't have an end-to-end test runner that drives
  real Resend traffic. Adding one is a separate piece of work — for now
  this checklist is the gate.
- Sentry should not be silent here either — every step-5 / step-6 failure
  case should emit a breadcrumb but not a fatal exception.
