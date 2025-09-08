// src/components/editor/EditorSidebar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Plus, Type, FileText, BarChart2, Image as ImageIcon, Film } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

interface EditorSidebarProps {
  projectId: string;
  datasetUrl: string | null | undefined;
}

const blockTypes = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'paragraph', label: 'Paragraph', icon: FileText },
  { type: 'chart', label: 'Chart', icon: BarChart2 },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: Film },
] as const;

export function EditorSidebar({ projectId, datasetUrl }: EditorSidebarProps) {
  const utils = trpc.useContext();

  const addBlockMutation = trpc.addStoryBlock.useMutation({
    onSuccess: () => {
      toast.success("Block added successfully!");
      utils.getProjectById.invalidate({ id: projectId });
    },
    onError: (err) => {
      toast.error("Failed to add block", { description: err.message });
    },
  });


  const handleAddBlock = (type: typeof blockTypes[number]['type']) => {
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
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="sticky top-16 h-[calc(100vh-4rem)] w-72 bg-card border-r flex flex-col p-4 space-y-6 overflow-y-auto">
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
      </aside>
    </TooltipProvider>
  );
}