// src/components/editor/FileUpload.tsx
'use client';

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/server/uploadthing";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button"; // Import Button component
import { Upload } from "lucide-react"; // Import Upload icon

interface FileUploadProps {
  projectId: string;
  currentDatasetUrl: string | null;
}

export function FileUpload({ projectId, currentDatasetUrl }: FileUploadProps) {
  const utils = trpc.useUtils();
  const linkDatasetMutation = trpc.linkDatasetToProject.useMutation();

  return (
    <UploadDropzone<OurFileRouter, "datasetUploader">
      endpoint="datasetUploader"
      onClientUploadComplete={(res) => {
        if (res?.[0]?.url) {
          linkDatasetMutation.mutate({
            projectId: projectId,
            fileUrl: res[0].url,
          }, {
            onSuccess: () => {
              toast.success("Dataset uploaded and linked successfully!");
              utils.getProjectById.invalidate({ id: projectId });
            }
          });
        }
      }}
      onUploadError={(error: Error) => {
        toast.error("Error uploading dataset", {
          description: error.message,
        });
      }}
      content={{
        label: "Drag and drop your dataset here",
        button: currentDatasetUrl ? "Change Dataset" : "Choose File",
      }}
      className="p-4 ut-label:text-sm ut-allowed-content:text-xs ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:active:bg-primary/80"
    />
  );
}