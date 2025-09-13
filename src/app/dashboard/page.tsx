'use client';

import { trpc } from '@/lib/trpc';
import { useSession, signIn } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, MoreVertical, Edit, Trash2, Eye, LayoutGrid, LogIn, List } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { toast } from 'sonner';
import { useState } from 'react';
import { Toggle } from '@/components/ui/toggle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const getProjectsQuery = trpc.getProjects.useQuery(undefined, { enabled: !!session });

  const createProjectMutation = trpc.createProject.useMutation({
    onSuccess: (newProject) => {
      toast.success(`Project "${newProject.title}" created successfully!`);
      utils.getProjects.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create project", {
        description: error.message,
      });
    }
  });

  const deleteProjectMutation = trpc.deleteProject.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully!");
      utils.getProjects.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete project", {
        description: error.message,
      });
    }
  });

  const handleCreateProject = () => {
    const title = prompt('Enter project title:');
    if (title) {
      createProjectMutation.mutate({ title });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate({ projectId });
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <PageWrapper>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Insight Flow</h1>
            <p className="mb-6 text-muted-foreground">Please sign in to continue</p>
            <Button onClick={() => signIn('google')}>
              <LogIn className="mr-2 h-4 w-4" /> Sign in with Google
            </Button>
          </div>
        </PageWrapper>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/40">
        <Header />
        <main className="container mx-auto py-8">
          <PageWrapper>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold tracking-tight">Your Projects</h2>
              <div className="flex items-center gap-2">
                <Toggle
                  size="sm"
                  pressed={view === 'list'}
                  onPressedChange={() => setView(view === 'grid' ? 'list' : 'grid')}
                >
                  {view === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                </Toggle>
                <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Create New Project
                </Button>
              </div>
            </div>

            {getProjectsQuery.isLoading && (
              <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {getProjectsQuery.data && getProjectsQuery.data.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-medium">No projects yet!</h3>
                <p className="text-muted-foreground mt-2 mb-6">Click "Create New Project" to get started.</p>
              </div>
            )}

            {Array.isArray(getProjectsQuery.data) && getProjectsQuery.data.length > 0 && (
              <motion.div
                className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {getProjectsQuery.data.map((project) => (
                  <motion.div key={project.id} variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Card className={view === 'list' ? 'flex items-center justify-between p-4' : "flex flex-col h-full"}>
                      <div className={view === 'list' ? 'flex items-center gap-4' : ''}>
                        <CardHeader className={view === 'list' ? 'p-0' : 'flex-row items-start justify-between'}>
                          <div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CardTitle className="truncate">{project.title}</CardTitle>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{project.title}</p>
                              </TooltipContent>
                            </Tooltip>
                            <CardDescription>Updated: {new Date(project.updatedAt).toLocaleDateString()}</CardDescription>
                          </div>
                          {view === 'grid' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild><Link href={`/project/${project.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </CardHeader>
                        {view === 'grid' && (
                          <CardFooter className="mt-auto">
                            <Button asChild className="w-full" variant="secondary">
                              <Link href={`/project/${project.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> View Public Page</Link>
                            </Button>
                          </CardFooter>
                        )}
                      </div>
                      {view === 'list' && (
                        <div className="flex items-center gap-2">
                          <Button asChild variant="secondary">
                            <Link href={`/project/${project.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> View</Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/project/${project.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </PageWrapper>
        </main>
      </div>
    </TooltipProvider>
  );
}