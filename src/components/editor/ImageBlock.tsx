// src/components/editor/ImageBlock.tsx
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadButton } from '@uploadthing/react';
import { OurFileRouter } from '@/server/uploadthing';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImagePlus, Search } from 'lucide-react';

interface ImageBlockProps {
  block: {
    id: string;
    content: any;
  };
  onContentUpdate: (newContent: any) => void;
}

export function ImageBlock({ block, onContentUpdate }: ImageBlockProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: unsplashImages, refetch: searchImages, isLoading: isSearching } = trpc.searchUnsplashImages.useQuery(
    { query: searchQuery },
    { enabled: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages();
  };

  const handleImageSelect = (url: string, alt: string) => {
    onContentUpdate({ url, alt });
    setIsDialogOpen(false);
  };

  if (block.content?.url) {
    return (
      <div className="relative group">
        <Image
          src={block.content.url}
          alt={block.content.alt || 'Story image'}
          width={1600}
          height={900}
          className="rounded-md object-cover"
        />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" onClick={() => onContentUpdate(null)}>
            Change Image
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg border-2 border-dashed p-8 text-center">
      <div className="flex justify-center gap-4">
        <UploadButton<OurFileRouter, "storyImageUploader">
          endpoint="storyImageUploader"
          onClientUploadComplete={(res) => {
            if (res?.[0]?.url) {
              handleImageSelect(res[0].url, "Uploaded image");
            }
          }}
          onUploadError={(error) => toast.error(error.message)}
        >
          {({ onClick }) => (
            <Button onClick={onClick} variant="outline"><ImagePlus className="mr-2 h-4 w-4" /> Upload Image</Button>
          )}
        </UploadButton>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Search className="mr-2 h-4 w-4" /> Search Unsplash</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Search for an Image</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="High-quality photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" disabled={isSearching}>Search</Button>
            </form>
            <div className="grid grid-cols-3 gap-4 h-96 overflow-y-auto mt-4">
              {isSearching && Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-full w-full" />)}
              {unsplashImages?.map(img => (
                <div key={img.id} className="cursor-pointer" onClick={() => handleImageSelect(img.url, img.alt)}>
                  <Image src={img.url} alt={img.alt} width={400} height={400} className="rounded-md object-cover aspect-square" />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}