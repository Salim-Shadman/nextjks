'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2 } from 'lucide-react';
import { AppRouter } from '@/server';
import { inferRouterOutputs } from '@trpc/server';
import { RichTextEditor } from './RichTextEditor';
import { ChartBlock } from './ChartBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type StoryBlockType = inferRouterOutputs<AppRouter>['getProjectById']['storyBlocks'][number];

interface SortableBlockItemProps {
  block: StoryBlockType;
  projectId: string;
}

export function SortableBlockItem({ block, projectId }: SortableBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const utils = trpc.useUtils();
  const [isEditing, setIsEditing] = useState(false);
  const [headingText, setHeadingText] = useState(
    block.type === 'heading' ? (block.content as { text: string }).text : ''
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const updateContentMutation = trpc.updateBlockContent.useMutation();
  const deleteBlockMutation = trpc.deleteStoryBlock.useMutation({
    onSuccess: () => {
      utils.getProjectById.invalidate({ id: projectId });
    }
  });

  const handleContentUpdate = (newContent: any) => {
    updateContentMutation.mutate({ blockId: block.id, content: newContent });
  };
  
  const handleDeleteBlock = () => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      deleteBlockMutation.mutate({ blockId: block.id });
    }
  };

  const saveHeading = () => {
    setIsEditing(false);
    handleContentUpdate({ text: headingText });
  };

  const renderContent = () => {
    if (block.type === 'heading') {
      if (isEditing) {
        return (
          <Input
            autoFocus
            value={headingText}
            onChange={(e) => setHeadingText(e.target.value)}
            onBlur={saveHeading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveHeading();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="text-2xl font-bold p-0 h-auto bg-transparent border-none focus-visible:ring-0"
          />
        );
      }
      return (
        <h2 className="text-2xl font-bold cursor-pointer p-1" onClick={() => setIsEditing(true)}>
          {(block.content as { text: string }).text || "Click to edit heading"}
        </h2>
      );
    }
    if (block.type === 'paragraph') {
      return <RichTextEditor content={block.content} onUpdate={handleContentUpdate} />;
    }
    if (block.type === 'chart') {
      return <ChartBlock projectId={projectId} block={block} />;
    }
    if (block.type === 'image') {
      return <ImageBlock block={block} onContentUpdate={handleContentUpdate} />;
    }
    if (block.type === 'video') {
        return <VideoBlock block={block} onContentUpdate={handleContentUpdate} />;
    }
    return <p>Unknown block type</p>;
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      className="group relative"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-row items-start gap-4">
            <div 
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <button {...attributes} {...listeners} className="cursor-grab p-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1">
              {renderContent()}
            </div>
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button variant="ghost" size="icon" onClick={handleDeleteBlock} disabled={deleteBlockMutation.isPending} className="h-8 w-8">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}