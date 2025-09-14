// src/components/viewer/BlockRenderer.tsx
'use client';

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useMemo, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { StoryBlockType } from '@/lib/types';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { ReactPlayerProps } from 'react-player';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Film, Loader2 } from 'lucide-react';

const ReactPlayer = dynamic<ReactPlayerProps>(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

const ChartView = dynamic(() => import('./ChartView').then(mod => mod.ChartView), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});

interface BlockRendererProps {
  block: StoryBlockType;
  dataset: any[];
}

export function BlockRenderer({ block, dataset }: BlockRendererProps) {
  if (block.type === 'heading') {
    const content = block.content as { text: string };
    return <h2 className="text-3xl font-bold">{content.text}</h2>;
  }

  if (block.type === 'paragraph') {
    if (!block.content) return null;
    const html = useMemo(
      () => generateHTML(block.content as Record<string, any>, [StarterKit, Link]),
      [block.content]
    );
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (block.type === 'chart') {
    if (!dataset) return null;
    return (
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ChartView data={dataset} content={block.content} />
      </Suspense>
    );
  }

  if (block.type === 'image') {
    const content = block.content as { url: string; alt: string };
    if (content.url) {
      return (
        <figure>
          <Image
            src={content.url}
            alt={content.alt || 'Story image'}
            width={1600}
            height={900}
            className="rounded-md object-cover"
            priority // Add priority prop here
          />
          {content.alt && <figcaption className="text-center text-sm text-muted-foreground mt-2">{content.alt}</figcaption>}
        </figure>
      );
    }
    return null;
  }

  if (block.type === 'video') {
    const content = block.content as { videoId?: string };
    const videoId = content.videoId;
    if (videoId) {
      return (
        <div className="overflow-hidden rounded-lg border bg-muted">
          <AspectRatio ratio={16 / 9}>
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${videoId}`}
              width="100%"
              height="100%"
              controls
            />
          </AspectRatio>
        </div>
      );
    } else {
      return (
        <div className="bg-muted/50 rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
          <Film className="mx-auto h-12 w-12" />
          <p className="mt-2 text-sm">A video will be displayed here.</p>
        </div>
      );
    }
  }

  return null;
}