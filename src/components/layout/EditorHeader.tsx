// src/components/layout/EditorHeader.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Share2, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EditorHeaderProps {
  projectId: string;
  projectTitle: string;
}

export function EditorHeader({ projectId, projectTitle }: EditorHeaderProps) {
  // State to give user feedback when the link is copied
  const [isCopied, setIsCopied] = useState(false);

  // Function to handle the copy action
  const handleShare = async () => {
    // Construct the full public URL
    const publicUrl = `${window.location.origin}/project/${projectId}`;
    
    try {
      // Use the modern clipboard API to copy the text
      await navigator.clipboard.writeText(publicUrl);
      
      // Show a success toast notification
      toast.success("Link copied to clipboard!");
      
      // Set the button state to "Copied!"
      setIsCopied(true);
      
      // Reset the button text back to "Share" after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

    } catch (err) {
      toast.error("Failed to copy the link.");
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Project</p>
            <h1 className="text-lg font-bold truncate">{projectTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Updated Share Button with onClick logic */}
          <Button variant="ghost" size="sm" onClick={handleShare}>
            {isCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {isCopied ? 'Copied!' : 'Share'}
          </Button>
          <Button asChild>
            <Link href={`/project/${projectId}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}