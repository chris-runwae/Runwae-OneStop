import type { Id } from "@runwae/convex/convex/_generated/dataModel";

function inferMime(uri: string) {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

/**
 * Upload a local image to Convex storage and persist it on the viewer's user
 * record. Returns the public URL set on `users.avatarUrl`.
 *
 * Caller passes mutation handles from the component:
 *
 * ```ts
 * const generateUrl = useMutation(api.users.generateAvatarUploadUrl);
 * const setAvatar = useMutation(api.users.setAvatar);
 * const url = await uploadAvatarFromUri(localUri, { generateUrl, setAvatar });
 * ```
 */
export async function uploadAvatarFromUri(
  localUri: string,
  ops: {
    generateUrl: () => Promise<string>;
    setAvatar: (args: { storageId: Id<"_storage"> }) => Promise<string>;
  },
): Promise<string> {
  const uploadUrl = await ops.generateUrl();
  const blob = await (await fetch(localUri)).blob();
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || inferMime(localUri) },
    body: blob,
  });
  if (!res.ok) {
    throw new Error(`Avatar upload failed (${res.status})`);
  }
  const { storageId } = (await res.json()) as { storageId: string };
  return await ops.setAvatar({ storageId: storageId as Id<"_storage"> });
}
