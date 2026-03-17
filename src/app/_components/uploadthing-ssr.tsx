export async function UploadThingSSR() {
  if (!process.env.UPLOADTHING_TOKEN) {
    return null;
  }

  const { NextSSRPlugin } = await import("@uploadthing/react/next-ssr-plugin");
  const { extractRouterConfig } = await import("uploadthing/server");
  const { ourFileRouter } = await import("rbrgs/server/uploadthing");

  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}
