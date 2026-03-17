import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

export function UploadThingSSR() {
  if (!process.env.UPLOADTHING_TOKEN) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ourFileRouter } = require("rbrgs/server/uploadthing") as {
    ourFileRouter: Parameters<typeof extractRouterConfig>[0];
  };

  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}
