// src/components/editor/EditorCanvas.tsx
'use client';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SortableBlockItem } from './SortableBlockItem';
import { trpc } from '@/lib/trpc';
import { AppRouter } from '@/server';
import { inferRouterOutputs } from '@trpc/server';
import { AnimatePresence, motion } from 'framer-motion';

type StoryBlockArrayType = inferRouterOutputs<AppRouter>['getProjectById']['storyBlocks'];

interface EditorCanvasProps {
  projectId: string;
  blocks: StoryBlockArrayType;
}

export function EditorCanvas({ projectId, blocks }: EditorCanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }));
  const utils = trpc.useUtils();
  const updateOrderMutation = trpc.updateBlockOrder.useMutation();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const orderedIds = arrayMove(blocks, oldIndex, newIndex).map(b => b.id);
      updateOrderMutation.mutate({ projectId, orderedIds }, {
        onSuccess: () => utils.getProjectById.invalidate({ id: projectId })
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto min-h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
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
                  <SortableBlockItem block={block} projectId={projectId} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 mt-4">
          <h3 className="text-xl font-medium">Canvas is Empty</h3>
          <p className="mt-2">Add a block from the sidebar to begin your story.</p>
        </div>
      )}
    </div>
  );
}