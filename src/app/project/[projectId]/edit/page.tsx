// src/app/project/[projectId]/edit/page.tsx
'use client';

import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { EditorHeader } from '@/components/layout/EditorHeader';
import { PageWrapper } from '@/components/layout/PageWrapper'; // Import the PageWrapper
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';

export default function ProjectEditPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project, isLoading, isError } = trpc.getProjectById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col">
        <Skeleton className="h-16 w-full flex-shrink-0" />
        <div className="flex flex-1 overflow-hidden">
          <Skeleton className="h-full w-80" />
          <div className="flex-1 p-16">
            <Skeleton className="h-full w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return <div className="flex h-screen items-center justify-center">Error loading project or project not found.</div>;
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col bg-muted/40">
        <EditorHeader projectId={project.id} projectTitle={project.title} />
        <div className="flex flex-1 overflow-hidden">
          <EditorSidebar projectId={project.id} datasetUrl={project.datasetUrl} />
          <main className="flex-1 overflow-y-auto p-8 md:p-16">
            <EditorCanvas projectId={project.id} blocks={project.storyBlocks} />
          </main>
        </div>
      </div>
    </PageWrapper>
  );
}