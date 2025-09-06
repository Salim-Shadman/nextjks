'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Plus, Type, FileText, BarChart2, Image as ImageIcon, Film } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EditorSidebarProps {
  projectId: string;
  datasetUrl: string | null | undefined;
}

export function EditorSidebar({ projectId, datasetUrl }: EditorSidebarProps) {
  const addBlockMutation = trpc.addStoryBlock.useMutation();
  const utils = trpc.useUtils();

  const handleAddBlock = (type: 'heading' | 'paragraph' | 'chart' | 'image' | 'video') => {
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
    }, { onSuccess: () => utils.getProjectById.invalidate({ id: projectId }) });
  };

  return (
    <TooltipProvider>
      <aside className="w-80 h-screen bg-card border-r flex flex-col p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold px-2">Dataset</h2>
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
        <hr />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold mb-2 px-2">Add Blocks</h2>
          <Button onClick={() => handleAddBlock('heading')} disabled={addBlockMutation.isPending} className="w-full justify-start" variant="ghost"><Plus className="mr-2 h-4 w-4" /> Add Heading</Button>
          <Button onClick={() => handleAddBlock('paragraph')} disabled={addBlockMutation.isPending} className="w-full justify-start" variant="ghost"><Type className="mr-2 h-4 w-4" /> Add Paragraph</Button>
          <Button onClick={() => handleAddBlock('chart')} disabled={addBlockMutation.isPending || !datasetUrl} className="w-full justify-start" variant="ghost"><BarChart2 className="mr-2 h-4 w-4" /> Add Chart</Button>
          <Button onClick={() => handleAddBlock('image')} disabled={addBlockMutation.isPending} className="w-full justify-start" variant="ghost"><ImageIcon className="mr-2 h-4 w-4" /> Add Image</Button>
          <Button onClick={() => handleAddBlock('video')} disabled={addBlockMutation.isPending} className="w-full justify-start" variant="ghost"><Film className="mr-2 h-4 w-4" /> Add Video</Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}