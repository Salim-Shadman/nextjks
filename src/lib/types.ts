// src/lib/types.ts
import { AppRouter } from "@/server";
import { inferRouterOutputs } from "@trpc/server";

// This creates a precise TypeScript type for a single story block
// based on the data that our tRPC API returns.
export type StoryBlockType = inferRouterOutputs<AppRouter>['getProjectById']['storyBlocks'][number];