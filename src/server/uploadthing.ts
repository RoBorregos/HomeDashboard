import type { FileRouter } from "uploadthing/next";

function createRouter() {
  // Guard: only initialize when the token is available
  if (!process.env.UPLOADTHING_TOKEN) {
    return {} as FileRouter;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createUploadthing } = require("uploadthing/next") as typeof import("uploadthing/next");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getServerAuthSession } = require("./auth") as typeof import("./auth");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { db } = require("./db") as typeof import("./db");

  const f = createUploadthing();

  return {
    imageUploader: f({
      image: { maxFileSize: "4MB", maxFileCount: 1 },
    })
      .middleware(async () => {
        const session = await getServerAuthSession();
        if (!session) {
          throw new Error("Unauthorized");
        }
        return { userId: session.user.id };
      })
      .onUploadComplete(async ({ metadata, file }) => {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.ufsUrl);
        return { uploadedBy: metadata.userId };
      }),
  } satisfies FileRouter;
}

export const ourFileRouter = createRouter();

export type OurFileRouter = typeof ourFileRouter;
