// src/server/index.ts
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from './trpc';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export const appRouter = router({
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return prisma.project.findMany({ where: { userId: ctx.session.user.id } });
  }),
  createProject: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.project.create({ data: { title: input.title, userId: ctx.session.user.id } });
    }),
  getProjectById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
        include: { storyBlocks: { orderBy: { order: 'asc' } } },
      });
      if (!project) throw new Error('Project not found');
      return project;
    }),
  // NEW: Public procedure for non-authenticated users
  getPublicProjectById: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { storyBlocks: { orderBy: { order: 'asc' } } },
      });
      return project;
    }),
  addStoryBlock: protectedProcedure
    .input(z.object({ projectId: z.string(), type: z.string(), content: z.any() }))
    .mutation(async ({ input }) => {
      const lastBlock = await prisma.storyBlock.findFirst({
        where: { projectId: input.projectId },
        orderBy: { order: 'desc' },
      });
      const newOrder = lastBlock ? lastBlock.order + 1 : 0;
      return prisma.storyBlock.create({
        data: { ...input, order: newOrder },
      });
    }),
  updateBlockOrder: protectedProcedure
    .input(z.object({ projectId: z.string(), orderedIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const transactions = input.orderedIds.map((id, index) =>
        prisma.storyBlock.update({ where: { id }, data: { order: index } })
      );
      await prisma.$transaction(transactions);
      return { success: true };
    }),
  updateBlockContent: protectedProcedure
    .input(z.object({ blockId: z.string(), content: z.any() }))
    .mutation(async ({ input }) => {
      await prisma.storyBlock.update({ where: { id: input.blockId }, data: { content: input.content } });
      return { success: true };
    }),
  linkDatasetToProject: protectedProcedure
    .input(z.object({ projectId: z.string(), fileUrl: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.project.update({ where: { id: input.projectId }, data: { datasetUrl: input.fileUrl } });
      return { success: true };
    }),
  getProjectDataset: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId, userId: ctx.session.user.id },
      });
      if (!project || !project.datasetUrl) {
        throw new Error('Dataset not found for this project.');
      }
      const response = await fetch(project.datasetUrl);
      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      return parsedData.data;
    }),
  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.project.delete({
        where: { 
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });
      return { success: true };
    }),
  deleteStoryBlock: protectedProcedure
    .input(z.object({ blockId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.storyBlock.delete({
        where: { id: input.blockId },
      });
      return { success: true };
    }),

  // NEW: Procedure to search for images on Unsplash
  searchUnsplashImages: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      if (!process.env.UNSPLASH_ACCESS_KEY) {
        throw new Error('Unsplash API key is not configured.');
      }
      if (!input.query) {
        return [];
      }
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(input.query)}&per_page=9`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          },
        }
      );
      const data = await response.json();
      // We only return the fields we need to the client
      return data.results.map((img: any) => ({
        id: img.id,
        url: img.urls.regular,
        alt: img.alt_description,
        author: img.user.name,
      }));
    }),
});

export type AppRouter = typeof appRouter;