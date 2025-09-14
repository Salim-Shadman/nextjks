// src/components/viewer/StoryViewer.tsx
'use client';

import { useEffect, useLayoutEffect, useRef, memo } from 'react';
import { BlockRenderer } from './BlockRenderer';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StoryBlockType } from '@/lib/types';

gsap.registerPlugin(ScrollTrigger);

interface StoryViewerProps {
  blocks: StoryBlockType[];
  dataset: any[]; // Accept dataset as a prop
}

const MemoizedBlockRenderer = memo(BlockRenderer);

export function StoryViewer({ blocks, dataset }: StoryViewerProps) {
  const component = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const reqId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    if (!component.current) return;
    const ctx = gsap.context(() => {
      const storyBlocks = gsap.utils.toArray<HTMLDivElement>('.story-block');
      storyBlocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, component);
    return () => ctx.revert();
  }, [blocks]);

  return (
    <div ref={component} className="max-w-5xl mx-auto">
      {blocks.map((block) => (
        <div key={block.id} className="story-block my-8">
          {/* Pass dataset down to each block renderer */}
          <MemoizedBlockRenderer block={block} dataset={dataset} />
        </div>
      ))}
    </div>
  );
}