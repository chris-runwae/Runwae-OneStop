// Generates the AUTH_APPLE_SECRET JWT for Convex Auth's Apple provider.
//
// Required env vars:
//   APPLE_TEAM_ID    — 10-char Apple Developer Team ID
//   APPLE_KEY_ID     — 10-char Key ID from Developer Portal → Keys
//   APPLE_CLIENT_ID  — Services ID (e.g. app.runwae.signin) for web OAuth,
//                      or bundle ID for pure-native flows
//   APPLE_P8_PATH    — absolute path to the .p8 private key downloaded once
//                      from Developer Portal
//
// Run from anywhere:
//   APPLE_TEAM_ID=… APPLE_KEY_ID=… APPLE_CLIENT_ID=… APPLE_P8_PATH=… \
//     node scripts/generate-apple-secret.mjs
//
// Pipe into Convex:
//   npx convex env set AUTH_APPLE_SECRET "$(node scripts/generate-apple-secret.mjs)"
//
// The JWT is valid for 180 days (Apple's hard ceiling is 6 months).
// Add a calendar reminder for the next rotation.

import { readFileSync } from 'node:fs';
import { createPrivateKey, sign } from 'node:crypto';

const { APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_CLIENT_ID, APPLE_P8_PATH } = process.env;

if (!APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_CLIENT_ID || !APPLE_P8_PATH) {
  console.error('Set APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_CLIENT_ID, APPLE_P8_PATH');
  process.exit(1);
}

const b64url = (input) =>
  Buffer.from(typeof input === 'string' ? input : JSON.stringify(input))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const now = Math.floor(Date.now() / 1000);
const header = { alg: 'ES256', kid: APPLE_KEY_ID, typ: 'JWT' };
const payload = {
  iss: APPLE_TEAM_ID,
  iat: now,
  exp: now + 60 * 60 * 24 * 180,
  aud: 'https://appleid.apple.com',
  sub: APPLE_CLIENT_ID,
};

const signingInput = `${b64url(header)}.${b64url(payload)}`;

const privateKey = createPrivateKey({
  key: readFileSync(APPLE_P8_PATH, 'utf8'),
  format: 'pem',
});

// ES256 JWTs need raw r||s signatures, not DER — `ieee-p1363` gives us that.
const signature = sign('sha256', Buffer.from(signingInput), {
  key: privateKey,
  dsaEncoding: 'ieee-p1363',
});

const sigB64 = signature.toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

console.log(`${signingInput}.${sigB64}`);
