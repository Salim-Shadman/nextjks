// src/server/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
    
const f = createUploadthing();

export const ourFileRouter = {
  // This uploader is for CSV/text datasets
  datasetUploader: f({ text: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Dataset upload complete for file:", file.url);
    }),

  // NEW: This uploader is specifically for images in the story editor
  storyImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log("Image upload complete for file:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;