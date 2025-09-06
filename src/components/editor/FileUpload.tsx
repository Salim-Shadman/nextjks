// src/components/editor/FileUpload.tsx
'use client';

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/server/uploadthing";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button"; // Import Button component
import { Upload } from "lucide-react"; // Import Upload icon

interface FileUploadProps {
  projectId: string;
  currentDatasetUrl: string | null; // Pass the current dataset URL
}

export function FileUpload({ projectId, currentDatasetUrl }: FileUploadProps) {
  const utils = trpc.useUtils();
  const linkDatasetMutation = trpc.linkDatasetToProject.useMutation();

  // Custom UploadButton that looks like a regular Shadcn Button
  const CustomUploadButton = (props: Parameters<typeof UploadButton>[0]) => (
    <UploadButton<OurFileRouter, "datasetUploader">
      {...props}
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
    >
      {/* This is the content inside the UploadButton. It uses a Shadcn Button */}
      <Button className="w-full" variant={currentDatasetUrl ? "outline" : "default"}>
        <Upload className="h-4 w-4 mr-2" />
        {currentDatasetUrl ? "Change Dataset" : "Choose File"}
      </Button>
    </UploadButton>
  );

  return <CustomUploadButton />;
}