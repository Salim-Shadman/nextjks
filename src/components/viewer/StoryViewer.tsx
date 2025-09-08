'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
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

export function StoryViewer({ blocks, projectId }: StoryViewerProps) {
  const component = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const storyBlocks = gsap.utils.toArray('.story-block');
      storyBlocks.forEach((block: any) => {
        gsap.fromTo(block, 
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

  // --- START: শুধুমাত্র এই লাইনে className পরিবর্তন করা হয়েছে ---
  return (
    <div ref={component} className="max-w-5xl mx-auto">
      {blocks.map((block) => (
        <div key={block.id} className="story-block">
          <div className="my-8">
            <BlockRenderer block={block} />
          </div>
        </div>
      ))}
    </div>
  );
  // --- END: পরিবর্তন এখানেই শেষ ---
}