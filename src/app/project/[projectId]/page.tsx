// src/app/project/[projectId]/page.tsx
import { serverClient } from '@/lib/trpc';
import { notFound } from 'next/navigation';
import { StoryViewer } from '@/components/viewer/StoryViewer';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LandingHeader } from '@/components/layout/LandingHeader';
import prisma from '@/lib/prisma'; // This import should now work correctly

// This function pre-renders all public projects at build time
export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
    },
  });

  return projects.map((project) => ({
    projectId: project.id,
  }));
}

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

  return (
    <div className="bg-background">
      <LandingHeader />
      <main className="container mx-auto py-8">
        <PageWrapper>
          <div className="mb-12 space-y-2 text-center">
            <h1 className="text-5xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <StoryViewer blocks={project.storyBlocks} projectId={project.id} />
        </PageWrapper>
      </main>
    </div>
  );
}