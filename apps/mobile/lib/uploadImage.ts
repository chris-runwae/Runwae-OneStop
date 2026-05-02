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
 * Upload a local image (file://… URI) to Convex storage and return its
 * public URL. Used by trip cover and itinerary item images. The
 * mutation handles are passed in from the call site so React stays in
 * charge of the Convex client lifecycle.
 *
 * Mirrors the lib/uploadAvatar.ts contract so callers can keep a
 * consistent shape across upload flows.
 */
export async function uploadImageFromUri(
  localUri: string,
  ops: {
    generateUrl: () => Promise<string>;
    resolveUrl: (args: { storageId: Id<"_storage"> }) => Promise<string>;
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
    throw new Error(`Image upload failed (${res.status})`);
  }
  const { storageId } = (await res.json()) as { storageId: string };
  return await ops.resolveUrl({ storageId: storageId as Id<"_storage"> });
}
