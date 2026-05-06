import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";

const f = createUploadthing();

async function requireHostViewer() {
  const token = await convexAuthNextjsToken();
  if (!token) throw new UploadThingError("Unauthorized");
  const viewer = await fetchQuery(api.users.getCurrentUser, {}, { token });
  if (!viewer || viewer.isHost !== true) {
    throw new UploadThingError("Forbidden");
  }
  return viewer;
}

export const uploadRouter = {
  eventCover: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const viewer = await requireHostViewer();
      return { userId: viewer._id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
  eventGallery: f({
    image: { maxFileSize: "8MB", maxFileCount: 8 },
  })
    .middleware(async () => {
      const viewer = await requireHostViewer();
      return { userId: viewer._id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
  hostAvatar: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const viewer = await requireHostViewer();
      return { userId: viewer._id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type HostUploadRouter = typeof uploadRouter;
