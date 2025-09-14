// src/app/project/[projectId]/page.tsx
import { serverClient } from '@/lib/trpc';
import { notFound } from 'next/navigation';
import { StoryViewer } from '@/components/viewer/StoryViewer';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LandingHeader } from '@/components/layout/LandingHeader';

// This line ensures the page is dynamically rendered
export const revalidate = 0;

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params;
  const project = await serverClient.getPublicProjectById.query({ projectId });

  if (!project) {
    return notFound();
  }

  const dataset = project.datasetUrl 
    ? await serverClient.getPublicProjectDataset.query({ projectId }) 
    : [];

  return (
    <div className="bg-background">
      <LandingHeader />
      <main className="container mx-auto py-8">
        <PageWrapper>
          <div className="mb-12 space-y-2 text-center">
            <h1 className="text-5xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-muted-foreground">{project.description || 'An interactive data story.'}</p>
          </div>
          <StoryViewer blocks={project.storyBlocks} dataset={dataset} />
        </PageWrapper>
      </main>
    </div>
  );
}