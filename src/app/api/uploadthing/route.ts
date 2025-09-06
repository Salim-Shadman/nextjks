// src/app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/server/uploadthing";

// This line is very important. It creates and exports both a GET and a POST handler.
// The error suggests your file might be missing the "POST" part.
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});