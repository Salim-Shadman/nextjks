'use client';

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useMemo } from 'react';
import { ChartView } from './ChartView';
import { trpc } from '@/lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { StoryBlockType } from '@/lib/types';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { ReactPlayerProps } from 'react-player';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Film } from 'lucide-react';

const ReactPlayer = dynamic<ReactPlayerProps>(() => import('react-player'), { ssr: false });

type Block = StoryBlockType;

export function BlockRenderer(props: { block: Block }) {
  const { block } = props;

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
    return <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (block.type === 'chart') {
    const { data, isLoading } = trpc.getProjectDataset.useQuery({ projectId: block.projectId as string });
    if (isLoading) return <Skeleton className="h-96 w-full" />;
    if (!data) return null;
    return <ChartView data={data} content={block.content} />;
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
          />
          {content.alt && <figcaption className="text-center text-sm text-muted-foreground mt-2">{content.alt}</figcaption>}
        </figure>
      );
    }
    return null;
  }

  if (block.type === 'video') {
    const content = block.content as { url: string };
    const url = content.url;

    if (url) {
      return (
        <div className="overflow-hidden rounded-lg border bg-muted">
          <AspectRatio ratio={16 / 9}>
            <ReactPlayer url={url} width="100%" height="100%" controls />
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