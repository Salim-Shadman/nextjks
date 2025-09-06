'use client';

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
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

type HeadingBlock = { type: 'heading'; content: { text: string } };
type ParagraphBlock = { type: 'paragraph'; content: Record<string, any> | null };
type ChartBlock = { type: 'chart'; content: any; projectId: string };
type ImageBlock = { type: 'image'; content: { url: string; alt: string } };
type VideoBlock = { type: 'video'; content: { url: string } };
type Block = HeadingBlock | ParagraphBlock | ChartBlock | ImageBlock | VideoBlock | StoryBlockType;

// --- URL Normalizer ---
function normalizeUrl(url: string): string {
  if (!url) return '';

  // If <iframe ... src="...">
  const iframeMatch = url.match(/src="([^"]+)"/);
  if (iframeMatch) {
    url = iframeMatch[1];
  }

  // Convert YouTube embed → watch
  if (url.includes('youtube.com/embed/')) {
    const videoId = url.split('/embed/')[1].split(/[?&]/)[0];
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Convert youtu.be → watch and remove new tracking parameters
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split(/[?&]/)[0];
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  return url;
}

export function BlockRenderer(props: { block: Block }) {
  const { block } = props;

  if (block.type === 'heading') {
    const content = (block as HeadingBlock).content;
    return <h2>{content.text}</h2>;
  }

  if (block.type === 'paragraph') {
    if (!block.content) return null;
    const html = useMemo(
      () => generateHTML(block.content as Record<string, any>, [StarterKit]),
      [block.content]
    );
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (block.type === 'chart') {
    const { data, isLoading } = trpc.getProjectDataset.useQuery({ projectId: block.projectId });
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
          {content.alt && <figcaption>{content.alt}</figcaption>}
        </figure>
      );
    }
    return null;
  }

  if (block.type === 'video') {
    const content = block.content as { url: string };
    const url = normalizeUrl(content.url);

    if (url) {
      return (
        <div className="overflow-hidden rounded-lg [&>div]:!w-full">
          <AspectRatio ratio={16 / 9}>
            <ReactPlayer url={url} width="100%" height="100%" controls />
          </AspectRatio>
        </div>
      );
    } else {
      return (
        <div className="bg-muted/50 rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
          <Film className="mx-auto h-12 w-12" />
          <p className="mt-2 text-sm">Video block added. Edit to add a valid URL.</p>
        </div>
      );
    }
  }

  return null;
}