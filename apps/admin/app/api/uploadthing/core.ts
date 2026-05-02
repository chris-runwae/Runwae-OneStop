import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";

const f = createUploadthing();

// Admin-only file routes. Both routes share the same auth gate: the request
// must come from a signed-in admin (we verify by calling api.users.getCurrentUser
// using the Convex Auth token forwarded from cookies).
async function requireAdminViewer() {
  const token = await convexAuthNextjsToken();
  if (!token) throw new UploadThingError("Unauthorized");
  const viewer = await fetchQuery(api.users.getCurrentUser, {}, { token });
  if (!viewer || viewer.isAdmin !== true) {
    throw new UploadThingError("Forbidden");
  }
  return viewer;
}

export const uploadRouter = {
  destinationHero: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const viewer = await requireAdminViewer();
      return { userId: viewer._id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
  destinationGallery: f({
    image: { maxFileSize: "8MB", maxFileCount: 12 },
  })
    .middleware(async () => {
      const viewer = await requireAdminViewer();
      return { userId: viewer._id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
  templateItemImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const viewer = await requireAdminViewer();
      return { userId: viewer._id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type AdminUploadRouter = typeof uploadRouter;
