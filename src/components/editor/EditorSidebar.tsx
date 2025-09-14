// src/components/editor/EditorSidebar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { FileText, BarChart2, Image as ImageIcon, Film, Type, X } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from '../icons/Logo';
import { useCallback } from 'react';
import { StoryBlockType } from '@/lib/types';

interface EditorSidebarProps {
  projectId: string;
  datasetUrl: string | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const blockTypes = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'paragraph', label: 'Paragraph', icon: FileText },
  { type: 'chart', label: 'Chart', icon: BarChart2 },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: Film },
] as const;

type BlockType = typeof blockTypes[number]['type'];

export function EditorSidebar({ projectId, datasetUrl, isOpen, onClose }: EditorSidebarProps) {
  const utils = trpc.useUtils();

  const addBlockMutation = trpc.addStoryBlock.useMutation({
    onMutate: async (newBlock) => {
      // 1. Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await utils.getProjectById.cancel({ id: projectId });

      // 2. Snapshot the previous value
      const previousProjectData = utils.getProjectById.getData({ id: projectId });

      // 3. Optimistically update to the new value
      if (previousProjectData) {
        // Create a temporary block with a random ID
        const optimisticBlock: StoryBlockType = {
          ...newBlock,
          id: `optimistic-${Date.now()}`,
          order: previousProjectData.storyBlocks.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        utils.getProjectById.setData({ id: projectId }, {
          ...previousProjectData,
          storyBlocks: [...previousProjectData.storyBlocks, optimisticBlock],
        });
      }
      
      toast.success("Block added!");
      return { previousProjectData };
    },
    onError: (err, newBlock, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousProjectData) {
        utils.getProjectById.setData({ id: projectId }, context.previousProjectData);
      }
      toast.error("Failed to add block", { description: err.message });
    },
    onSettled: () => {
      // 4. Always refetch after error or success to ensure data consistency
      utils.getProjectById.invalidate({ id: projectId });
    },
  });

  const handleAddBlock = useCallback((type: BlockType) => {
    let content: any;
    switch (type) {
      case 'heading': content = { text: 'New Heading' }; break;
      case 'paragraph': content = { type: 'doc', content: [{ type: 'paragraph' }] }; break;
      case 'chart': content = { type: 'bar', xKey: '', yKey: '' }; break;
      case 'image': content = { url: null, alt: null }; break;
      case 'video': content = { url: null }; break;
    }

    addBlockMutation.mutate({
      projectId: projectId,
      type: type,
      content: content,
    });
  }, [addBlockMutation, projectId]);

  return (
    <TooltipProvider delayDuration={0}>
      <div 
        className={cn("fixed inset-0 bg-black/50 z-30 md:hidden", isOpen ? "block" : "hidden")}
        onClick={onClose}
      />
      <aside className={cn(
        "bg-card border-r flex flex-col space-y-4 transition-transform duration-300 ease-in-out z-40",
        "fixed top-0 left-0 h-full w-72 md:w-auto md:h-auto md:static",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-72 md:translate-x-0"
      )}>
        <div className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <Logo />
            <span className="text-lg font-bold">Insight Flow</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col space-y-6 overflow-y-auto px-4">
            <div className="flex items-center justify-between md:hidden">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold px-2 mb-2">Dataset</h2>
              {datasetUrl ? (
                <div className="flex flex-col gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 rounded-md border bg-muted text-sm flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{datasetUrl.split('/').pop()}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{datasetUrl.split('/').pop()}</p></TooltipContent>
                  </Tooltip>
                  <FileUpload projectId={projectId} currentDatasetUrl={datasetUrl} />
                </div>
              ) : (
                <FileUpload projectId={projectId} currentDatasetUrl={null} />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-semibold mb-2 px-2">Add Blocks</h2>
              {blockTypes.map((block) => {
                const isDisabled = addBlockMutation.isPending || (block.type === 'chart' && !datasetUrl);
                return (
                  <Tooltip key={block.type}>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Button 
                          onClick={() => handleAddBlock(block.type)} 
                          disabled={isDisabled} 
                          className="w-full justify-start" 
                          variant="ghost"
                        >
                          <block.icon className="mr-2 h-4 w-4" /> 
                          {block.label}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Add a new {block.label.toLowerCase()} block.</p>
                      {block.type === 'chart' && !datasetUrl && <p className="text-xs text-destructive">A dataset must be uploaded first.</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}