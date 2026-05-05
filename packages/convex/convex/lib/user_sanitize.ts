import type { Doc } from "../_generated/dataModel";

// Two-mode sanitisation:
// - Self: the viewer's own record. Reveals suspendedAt so the consumer
//   can render a "your account is suspended" banner. Always strips
//   suspensionReason — that's admin-to-admin commentary.
// - Other: anyone else. Also strips suspendedAt and isAdmin. The fact
//   that someone is suspended (or an admin) is internal signal, not
//   profile metadata.

export type PublicUserSelf = Omit<Doc<"users">, "suspensionReason">;
export type PublicUserOther = Omit<
  Doc<"users">,
  "suspensionReason" | "suspendedAt" | "isAdmin"
>;

export function toPublicUserSelf(user: Doc<"users">): PublicUserSelf {
  const { suspensionReason: _r, ...rest } = user;
  return rest;
}

export function toPublicUserSelfOrNull(
  user: Doc<"users"> | null
): PublicUserSelf | null {
  return user === null ? null : toPublicUserSelf(user);
}

export function toPublicUserOther(user: Doc<"users">): PublicUserOther {
  const {
    suspensionReason: _r,
    suspendedAt: _s,
    isAdmin: _a,
    ...rest
  } = user;
  return rest;
}

export function toPublicUserOtherOrNull(
  user: Doc<"users"> | null
): PublicUserOther | null {
  return user === null ? null : toPublicUserOther(user);
}
