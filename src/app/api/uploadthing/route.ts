import { type NextRequest, NextResponse } from "next/server";

const notConfigured = () =>
  NextResponse.json({ error: "UploadThing not configured" }, { status: 503 });

let GET: (req: NextRequest) => Promise<Response> = async () => notConfigured();
let POST: (req: NextRequest) => Promise<Response> = async () => notConfigured();

if (process.env.UPLOADTHING_TOKEN) {
  const { ourFileRouter } = await import("rbrgs/server/uploadthing");
  const { createRouteHandler } = await import("uploadthing/next");
  const handler = createRouteHandler({ router: ourFileRouter });
  GET = handler.GET;
  POST = handler.POST;
}

export { GET, POST };
