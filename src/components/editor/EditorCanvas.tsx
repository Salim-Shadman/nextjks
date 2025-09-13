// src/components/editor/EditorCanvas.tsx
'use client';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SortableBlockItem } from './SortableBlockItem';
import { trpc } from '@/lib/trpc';
import { AppRouter } from '@/server';
import { inferRouterOutputs } from '@trpc/server';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useCallback, memo } from 'react';
import { toast } from 'sonner';

type StoryBlockArrayType = inferRouterOutputs<AppRouter>['getProjectById']['storyBlocks'];

interface EditorCanvasProps {
  projectId: string;
  blocks: StoryBlockArrayType;
  dataset: any[];
  isDatasetError: boolean;
}

const MemoizedSortableBlockItem = memo(SortableBlockItem);

export function EditorCanvas({ projectId, blocks, dataset, isDatasetError }: EditorCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }));
  const utils = trpc.useContext();

  const updateOrderMutation = trpc.updateBlockOrder.useMutation({
    onMutate: async (newOrder) => {
      await utils.getProjectById.cancel({ id: projectId });
      const previousProjectData = utils.getProjectById.getData({ id: projectId });

      if (previousProjectData) {
        const optimisticBlocks = newOrder.orderedIds.map(id =>
          previousProjectData.storyBlocks.find(b => b.id === id)
        ).filter(Boolean) as StoryBlockArrayType;

        utils.getProjectById.setData({ id: projectId }, {
          ...previousProjectData,
          storyBlocks: optimisticBlocks,
        });
      }
      return { previousProjectData };
    },
    onError: (err, newOrder, context) => {
      if (context?.previousProjectData) {
        utils.getProjectById.setData({ id: projectId }, context.previousProjectData);
      }
      toast.error("Failed to reorder blocks", { description: err.message });
    },
    onSettled: () => {
      utils.getProjectById.invalidate({ id: projectId });
    },
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const orderedIds = arrayMove(blocks, oldIndex, newIndex).map(b => b.id);

      updateOrderMutation.mutate({ projectId, orderedIds });
    }
  }, [blocks, projectId, updateOrderMutation]);

  return (
    <div className="max-w-3xl mx-auto min-h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            <AnimatePresence>
              {blocks.map((block) => (
                <motion.div
                  key={block.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <MemoizedSortableBlockItem
                    block={block}
                    projectId={projectId}
                    dataset={dataset}
                    isDatasetError={isDatasetError}
                    isDragging={activeId === block.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 mt-4">
          <h3 className="text-xl font-medium">Your Canvas is Blank</h3>
          <p className="mt-2">Add a block from the sidebar to start building your story.</p>
        </div>
      )}
    </div>
  );
}