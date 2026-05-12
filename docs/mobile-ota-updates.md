# Mobile OTA Updates

How JavaScript-only updates ship to installed builds without going through TestFlight / Play Store review.

## Config invariants (don't change without thinking)

- `apps/mobile/app.config.ts:68-70` — `runtimeVersion: { policy: 'appVersion' }`. OTAs are scoped to the **native app version**. A user on `0.8.7` only receives updates whose `runtimeVersion` is `0.8.7`. Bumping `version` in `package.json` cuts a new runtime version automatically.
- `apps/mobile/eas.json` — every build profile has a matching `channel` (`development`, `preview`, `production`). The channel on a build is permanent — OTAs land based on which channel was baked into the build.
- `apps/mobile/app.config.ts:225-230` — `updates.url` points to `u.expo.dev/<projectId>`. EAS Update is the delivery service.

## When to OTA vs build a new binary

| Change | Ship how |
|---|---|
| JS-only (components, hooks, copy, styles, business logic) | **OTA** — fast, ~30s after the next foreground |
| New / upgraded native module (anything in `app.config.ts` plugins, or a dep with `ios/` or `android/` directories) | **Build** — `eas build` then resubmit |
| Asset added to `assets/` or a font registered in `fonts:` | Build (native asset bundle) |
| `app.config.ts` permissions / capabilities / entitlements | Build |
| Convex schema or backend logic | N/A — those deploy with `npx convex deploy`, not OTA |

Rule of thumb: if you'd need a fresh `eas build` to test the change locally, it can't ship via OTA.

## Publishing an update

From `apps/mobile/`:

```bash
# Preview channel — TestFlight builds only
eas update --branch preview --message "Brief description of what changed"

# Production channel — App Store builds only
eas update --branch production --message "Brief description of what changed"
```

The `--branch` arg picks which channel receives the update. `--message` shows up in `eas update:list` and is visible in the EAS dashboard — write something useful.

EAS uploads the JS bundle + assets, signs the manifest, and starts serving it. Existing installed builds check on next launch (per `updates.checkAutomatically: 'ON_LOAD'`) and download in the background.

## Rolling back

`eas update --branch <branch> --republish` republishes a previous update by ID. Run `eas update:list --branch <branch>` first to get the ID.

The fast path:

```bash
eas update:list --branch production --limit 5
# Find the last-known-good update ID

eas update --branch production --republish --group <updateGroupId> --message "rollback to <reason>"
```

For a true emergency where the latest JS is causing crashes, use `eas update:rollback --branch production` (without `--republish`) which republishes the previous *manifest* atomically.

## What the user experiences

- App opens → fetches manifest → if a newer update exists for the same runtimeVersion + channel, downloads in background.
- The new bundle is **applied on next foreground**, not the current session. So users will see updates one launch later than the download.
- If the user is offline at launch, the cached bundle runs. No network = no breakage.

## Verifying channel isolation

Before relying on this for production, confirm a preview update does **not** reach production builds (and vice versa):

```bash
# Publish a no-op to preview
eas update --branch preview --message "channel isolation test"

# Open a production build. It should NOT pick up the update —
# check via Settings → Developer (long-press app icon) or by adding a
# temporary Constants.expoConfig?.extra.testMarker to the home screen.

# Then publish a no-op to production. Preview build should NOT pick it up.
eas update --branch production --message "channel isolation test"
```

If a channel update bleeds across channels, the build was misconfigured at build time — the channel is baked into the manifest signing keys.

## Debugging "update not arriving"

In rough order of likelihood:

1. **runtimeVersion mismatch.** The update was published when `package.json` was at `0.8.7`, but the installed build is on `0.8.6`. Check the build's runtime version via `eas build:view <buildId>`.
2. **Wrong channel.** `eas update --branch preview` won't reach a `production` build. Sanity-check with `eas update:list --branch <branch>`.
3. **`checkAutomatically` is set to a different mode.** Currently `ON_LOAD`; if anyone flips this to `ON_ERROR_RECOVERY`, the user only gets the update after a crash.
4. **Update server outage.** EAS Update has rare incidents — check status.expo.dev.

## Tying OTA bundles to Sentry events

`apps/mobile/lib/sentry.ts` sets `dist = Updates.updateId` (or `"embedded"` for the bundled JS). In Sentry, the **Release** field is the native app version and **Distribution** is the OTA bundle ID. A spike in errors only on a specific Distribution ID is a clean signal that a single OTA caused it — roll back that update and you're done.
