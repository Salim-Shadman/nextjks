'use client';

import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Film, Loader2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

function extractUrlFromString(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s"']+)/g;
  const found = text.match(urlRegex);
  return found ? found[0] : null;
}

interface VideoBlockProps {
  block: {
    id: string;
    content?: {
      url?: string | null;
    };
  };
  onContentUpdate: (newContent: any) => void;
}

export function VideoBlock({ block, onContentUpdate }: VideoBlockProps) {
  const [inputValue, setInputValue] = useState(block.content?.url ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync external changes (e.g., from server) with internal state
    if (block.content?.url !== inputValue) {
      setInputValue(block.content?.url ?? '');
    }
  }, [block.content?.url]);

  const handleUrlChange = async () => {
    const extractedUrl = extractUrlFromString(inputValue);
    if (extractedUrl) {
      setLoading(true);
      await onContentUpdate({ url: extractedUrl });
      setLoading(false);
    } else {
      console.error('No valid URL found in the input.');
    }
  };

  const videoUrl = block.content?.url ?? null;

  if (videoUrl) {
    return (
      <div>
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
          <ReactPlayer url={videoUrl} width="100%" height="100%" controls />
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
        Paste a YouTube or Vimeo link/embed code below.
      </p>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Paste link here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUrlChange();
          }}
          disabled={loading}
        />
        <Button onClick={handleUrlChange} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Embed'}
        </Button>
      </div>
    </div>
  );
}