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

    binnacleUploader: f({
      pdf: { maxFileSize: "4MB", maxFileCount: 1 },
    })
      .middleware(async () => {
        const session = await getServerAuthSession();
        if (!session?.user?.teamId) {
          throw new Error("User isn't in a team");
        }
        return { teamId: session.user.teamId };
      })
      .onUploadComplete(async ({ metadata, file }) => {
        await db.team.update({
          where: { id: metadata.teamId },
          data: { binnacleLink: file.ufsUrl },
        });
        return { binnacleLink: file.ufsUrl, teamId: metadata.teamId };
      }),

    robotImageUploader: f({
      "image/jpeg": { maxFileSize: "4MB", maxFileCount: 1 },
      "image/png": { maxFileSize: "4MB", maxFileCount: 1 },
    })
      .middleware(async () => {
        const session = await getServerAuthSession();
        if (!session?.user?.teamId) {
          throw new Error("User isn't in a team");
        }
        return { teamId: session.user.teamId };
      })
      .onUploadComplete(async ({ metadata, file }) => {
        await db.team.update({
          where: { id: metadata.teamId },
          data: { robotImageLink: file.ufsUrl },
        });
        return { robotImageLink: file.ufsUrl, teamId: metadata.teamId };
      }),
  } satisfies FileRouter;
}

export const ourFileRouter = createRouter();

export type OurFileRouter = typeof ourFileRouter;
