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
  projectId: string;
}

const MemoizedBlockRenderer = memo(BlockRenderer);

export function StoryViewer({ blocks, projectId }: StoryViewerProps) {
  const component = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis();
    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const reqId = requestAnimationFrame(raf);

    // Cleanup function to destroy Lenis instance
    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    if (!component.current) return;
    // Animate story blocks on scroll using GSAP
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

    // Cleanup GSAP context on unmount
    return () => ctx.revert();
  }, [blocks]);

  return (
    <div ref={component} className="max-w-5xl mx-auto">
      {blocks.map((block) => (
        <div key={block.id} className="story-block my-8">
          <MemoizedBlockRenderer block={block} />
        </div>
      ))}
    </div>
  );
}