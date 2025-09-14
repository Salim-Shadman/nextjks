// src/components/editor/VideoBlock.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { ReactPlayerProps } from 'react-player';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Film, Loader2, XCircle } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';
import { StoryBlockType } from '@/lib/types';
import { getYoutubeVideoId } from '@/lib/utils';

const ReactPlayer = dynamic<ReactPlayerProps>(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface VideoBlockProps {
  block: StoryBlockType;
  onContentUpdate: (newContent: any) => void;
}

export function VideoBlock({ block, onContentUpdate }: VideoBlockProps) {
  const initialVideoId = (block.content as { videoId?: string | null })?.videoId ?? null;

  const [displayVideoId, setDisplayVideoId] = useState<string | null>(initialVideoId);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newVideoId = (block.content as { videoId?: string | null })?.videoId ?? null;
    setDisplayVideoId(newVideoId);
  }, [block.content]);

  const handleUrlChange = useCallback(() => {
    const videoId = getYoutubeVideoId(inputValue);

    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid link.');
      toast.error('Invalid YouTube URL.');
      return;
    }

    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      onContentUpdate({ videoId: videoId });
      setDisplayVideoId(videoId);
      toast.success('Video embedded successfully!');
      setLoading(false);
      setInputValue('');
    }, 500);
  }, [inputValue, onContentUpdate]);

  const handleRemoveVideo = useCallback(() => {
    onContentUpdate({ videoId: null });
    setDisplayVideoId(null);
  }, [onContentUpdate]);

  if (displayVideoId) {
    return (
      <div>
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${displayVideoId}`}
            width="100%"
            height="100%"
            controls
            config={{
              youtube: {
                playerVars: {
                  origin: typeof window !== 'undefined' ? window.location.origin : '',
                },
              },
            }}
          />
        </AspectRatio>
        <div className="mt-2 text-center">
          <Button variant="link" size="sm" onClick={handleRemoveVideo}>
            Change Video
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg border-2 border-dashed p-8 text-center">
      <div className="mx-auto h-12 w-12 text-muted-foreground">
        <Film />
      </div>
      <h3 className="mt-4 text-lg font-medium">Embed a YouTube Video</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Paste a YouTube video link below.
      </p>
      <div className="flex items-center gap-2">
        <Input
          placeholder="https://www.youtube.com/watch?v=..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUrlChange();
          }}
          disabled={loading}
          className={error ? 'border-destructive' : ''}
        />
        <Button onClick={handleUrlChange} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Embed'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-2 flex items-center justify-center gap-1">
          <XCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}