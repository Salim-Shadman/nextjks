// src/components/layout/EditorHeader.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Share2, Check, Menu } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Input } from '../ui/input';

// The props interface is updated here
interface EditorHeaderProps {
  projectId: string;
  projectTitle: string;
  onToggleSidebar: () => void; // This new prop is added
}

export function EditorHeader({ projectId, projectTitle, onToggleSidebar }: EditorHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(projectTitle);
  const utils = trpc.useUtils();

  // This mutation needs to be added to your tRPC router in `src/server/index.ts`
  const updateTitleMutation = trpc.updateProjectTitle.useMutation({
    onSuccess: () => {
      toast.success("Project title updated.");
      utils.getProjectById.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error("Failed to update title.", { description: error.message });
      setTitle(projectTitle);
    }
  });

  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/project/${projectId}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public link copied to clipboard!");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error('Failed to copy: ', err);
    }
  };

  const handleTitleSave = () => {
    if (title.trim() && title !== projectTitle) {
      updateTitleMutation.mutate({ projectId, title });
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="bg-card border-b sticky top-0 z-20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          {/* This button is for mobile view to toggle the sidebar */}
          <Button variant="outline" size="icon" className="md:hidden" onClick={onToggleSidebar}>
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          
          {/* This button is for desktop view to go back */}
          <Button variant="outline" size="icon" asChild className="hidden md:inline-flex">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>

          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground hidden md:block">Editor</p>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  onBlur={handleTitleSave}
                  className="h-8 text-lg font-bold"
                  autoFocus
                />
              </div>
            ) : (
              <h1 
                className="text-lg font-bold truncate cursor-pointer hover:bg-muted p-1 rounded-md" 
                onClick={() => setIsEditingTitle(true)}
              >
                {projectTitle}
              </h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleShare}>
            {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
            {isCopied ? 'Copied!' : 'Share'}
          </Button>
          <Button asChild>
            <Link href={`/project/${projectId}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Preview</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}