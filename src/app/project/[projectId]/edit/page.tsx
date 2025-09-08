// src/app/project/[projectId]/edit/page.tsx
'use client';

import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { EditorHeader } from '@/components/layout/EditorHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';

export default function ProjectEditPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project, isLoading, isError } = trpc.getProjectById.useQuery(
    { id: projectId },
    { 
      enabled: !!projectId,
      retry: 1, // Don't retry indefinitely on error
    }
  );

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col">
        <Skeleton className="h-16 w-full flex-shrink-0" />
        <div className="flex flex-1 overflow-hidden">
          <Skeleton className="h-full w-72 flex-shrink-0" />
          <div className="flex-1 p-16 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-8">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex h-screen items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold text-destructive mb-2">Project Not Found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist or you do not have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col bg-background">
        <EditorHeader projectId={project.id} projectTitle={project.title} />
        <div className="flex-1 flex items-start">
          <EditorSidebar projectId={project.id} datasetUrl={project.datasetUrl} />
          <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 lg:p-12 bg-muted/40">
            <EditorCanvas projectId={project.id} blocks={project.storyBlocks} />
          </main>
        </div>
      </div>
    </PageWrapper>
  );
}