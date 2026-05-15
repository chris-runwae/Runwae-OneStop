# Runbook — Rotate `SENTRY_AUTH_TOKEN`

The token currently referenced as `$SENTRY_AUTH_TOKEN` in
`apps/mobile/eas.json` (lines 29 and 45) lets EAS Build upload source maps
and release artefacts to Sentry. Rotate it on a 90-day cadence, immediately
if leaked, or whenever a team member with token access leaves.

## When to rotate

- Suspected leak (committed to a repo, posted in chat, etc.).
- Personnel change.
- Every 90 days as routine hygiene.
- Sentry warns the token is approaching its scope expiry.

## Pre-flight

- You need owner-level access in the Sentry organisation `runwae`.
- You need access to the EAS project (`d77a53ae-5728-4c93-a97a-18343cee6777`)
  with permission to write secrets (`eas secret:create`).
- Pin a colleague to be the second pair of eyes — rotations have caused
  preview-build failures in the past when the old token was revoked before
  the new one was wired.

## Steps

1. **Generate a new token**
   - Sentry → Settings → Auth Tokens → "Create New Token".
   - Scopes required:
     - `project:releases`
     - `org:read`
   - Name it `eas-build-<YYYY-MM-DD>` so the dashboard reads cleanly.
   - Copy the value — Sentry only shows it once.

2. **Push to EAS secrets**
   - If the secret doesn't yet exist:
     ```
     eas secret:create --scope project \
       --name SENTRY_AUTH_TOKEN \
       --value <NEW_TOKEN>
     ```
   - If it already exists:
     ```
     eas secret:delete --scope project --name SENTRY_AUTH_TOKEN
     eas secret:create --scope project \
       --name SENTRY_AUTH_TOKEN \
       --value <NEW_TOKEN>
     ```
   - Confirm it's listed: `eas secret:list --scope project`.

3. **Smoke-test on preview**
   - Kick a preview build:
     ```
     eas build --profile preview --platform ios
     ```
   - Watch the build log for `Sentry CLI uploading source maps`. It should
     succeed; `SENTRY_ALLOW_FAILURE=true` is set in `eas.json` so a
     misconfigured token would silently swallow upload errors — that's why
     we check the log explicitly, not just the build exit code.
   - After the build lands, open Sentry → Releases. The new build's
     version should appear within ~5 minutes with source maps attached.

4. **Revoke the old token**
   - Sentry → Settings → Auth Tokens → revoke the previous `eas-build-*`
     entry.
   - Do this AFTER step 3 succeeds — revoking first means an in-flight
     build with the old value will fail.

5. **Re-run a production build** (if you're in a release window)
   - `eas build --profile production --platform ios`
   - Same check: source maps in Sentry within ~5 minutes.

## Rollback

If step 3 fails (Sentry CLI errors visible in logs):

1. Re-create the old token in Sentry (if you can — depends on whether you
   already revoked it).
2. If not, generate a fresh token and re-do steps 1-3.
3. The faulty token doesn't break the build (we ship with
   `SENTRY_ALLOW_FAILURE=true`); it just means no source maps. Don't panic
   — there's no user impact, only debuggability.

## Notes

- `eas.json` references the variable as `$SENTRY_AUTH_TOKEN` in the
  `preview` and `production` profiles. The `development` profile sets
  `SENTRY_DISABLE_AUTO_UPLOAD=true` and doesn't need a token.
- Do not commit the token to git, `.env`, or any package config.
- Local dev (`expo run:*`) does not upload to Sentry; you don't need this
  token on your laptop.
