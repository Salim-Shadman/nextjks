// src/components/editor/VideoBlock.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Film, Loader2, XCircle } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';
import { StoryBlockType } from '@/lib/types';

interface VideoBlockProps {
  block: StoryBlockType;
  onContentUpdate: (newContent: any) => void;
}

export function VideoBlock({ block, onContentUpdate }: VideoBlockProps) {
  const content = block.content as { url?: string | null };
  const [inputValue, setInputValue] = useState(content?.url ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- START: শুধুমাত্র এই useEffect হুকটি পরিবর্তন করা হয়েছে ---
  useEffect(() => {
    // This effect now correctly syncs the input value only when the block's content prop changes from the outside.
    setInputValue(content?.url ?? '');
  }, [content?.url]);
  // --- END: পরিবর্তন এখানেই শেষ ---

  const handleUrlChange = useCallback(async () => {
    if (!inputValue) {
      setError('Please enter a video URL.');
      return;
    }

    setLoading(true);
    setError(null);

    const isSupported = ReactPlayer.canPlay(inputValue);

    if (isSupported) {
      onContentUpdate({ url: inputValue });
      toast.success('Video embedded successfully!');
    } else {
      setError('Invalid or unsupported video URL. Please check the link and try again.');
      toast.error('Invalid or unsupported video URL.');
    }

    setLoading(false);
  }, [inputValue, onContentUpdate]);

  const videoUrl = content?.url ?? null;

  if (videoUrl) {
    return (
      <div>
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden flex items-center justify-center">
          {isClient ? (
            <ReactPlayer
              url={videoUrl}
              width="100%"
              height="100%"
              controls
              config={{
                youtube: {
                  playerVars: { origin: typeof window !== 'undefined' ? window.location.origin : '' },
                },
              }}
            />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          )}
        </AspectRatio>
        <div className="mt-2 text-center">
          <Button variant="link" size="sm" onClick={() => onContentUpdate({ url: null })}>
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
      <h3 className="mt-4 text-lg font-medium">Embed a Video</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Paste a YouTube, Vimeo, or other supported video link below.
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