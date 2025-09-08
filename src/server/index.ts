// src/server/index.ts
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from './trpc';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';
import { TRPCError } from '@trpc/server';

export const appRouter = router({
  // --- Project Procedures ---
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return prisma.project.findMany({ 
      where: { userId: ctx.session.user.id },
      orderBy: { updatedAt: 'desc' }
    });
  }),

  createProject: protectedProcedure
    .input(z.object({ title: z.string().min(1, "Title is required.") }))
    .mutation(async ({ ctx, input }) => {
      return prisma.project.create({ 
        data: { title: input.title, userId: ctx.session.user.id } 
      });
    }),

  getProjectById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
        include: { storyBlocks: { orderBy: { order: 'asc' } } },
      });
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found.' });
      }
      return project;
    }),
  
  updateProjectTitle: protectedProcedure
    .input(z.object({ projectId: z.string(), title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const project = await prisma.project.updateMany({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
        data: {
          title: input.title,
        },
      });

      if (project.count === 0) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Could not update project.' });
      }
      return { success: true };
    }),

  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // The schema is set to cascade delete, so blocks will be deleted too.
      await prisma.project.delete({
        where: { 
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      });
      return { success: true };
    }),

  // --- Public Project Procedure ---
  getPublicProjectById: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        include: { storyBlocks: { orderBy: { order: 'asc' } } },
      });
      return project;
    }),

  // --- Story Block Procedures ---
  addStoryBlock: protectedProcedure
    .input(z.object({ projectId: z.string(), type: z.string(), content: z.any() }))
    .mutation(async ({ ctx, input }) => {
      // First, verify the user owns the project they're adding a block to
      const project = await prisma.project.findUnique({ where: { id: input.projectId }});
      if (!project || project.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

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
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the project
      const project = await prisma.project.findUnique({ where: { id: input.projectId }});
      if (!project || project.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const transactions = input.orderedIds.map((id, index) =>
        prisma.storyBlock.update({ where: { id }, data: { order: index } })
      );
      await prisma.$transaction(transactions);
      return { success: true };
    }),

  updateBlockContent: protectedProcedure
    .input(z.object({ blockId: z.string(), content: z.any() }))
    .mutation(async ({ ctx, input }) => {
      const blockToUpdate = await prisma.storyBlock.findUnique({
        where: { id: input.blockId },
        select: { project: { select: { userId: true }}}
      });

      if(blockToUpdate?.project.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      await prisma.storyBlock.update({ 
        where: { id: input.blockId }, 
        data: { content: input.content } 
      });

      return { success: true };
    }),

  deleteStoryBlock: protectedProcedure
    .input(z.object({ blockId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const blockToDelete = await prisma.storyBlock.findUnique({
        where: { id: input.blockId },
        select: { project: { select: { userId: true }}}
      });
      
      if(blockToDelete?.project.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await prisma.storyBlock.delete({
        where: { id: input.blockId },
      });
      return { success: true };
    }),

  // --- Dataset Procedures ---
  linkDatasetToProject: protectedProcedure
    .input(z.object({ projectId: z.string(), fileUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.project.updateMany({ 
        where: { id: input.projectId, userId: ctx.session.user.id }, 
        data: { datasetUrl: input.fileUrl } 
      });
      return { success: true };
    }),

  getProjectDataset: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId, userId: ctx.session.user.id },
      });
      if (!project || !project.datasetUrl) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Dataset not found for this project.'});
      }
      const response = await fetch(project.datasetUrl);
      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically convert numbers and booleans
      });
      return parsedData.data;
    }),

  // --- Unsplash API Procedure ---
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
      if (!response.ok) {
        throw new Error('Failed to fetch images from Unsplash.');
      }
      const data = await response.json();
      return data.results.map((img: any) => ({
        id: img.id,
        url: img.urls.regular,
        alt: img.alt_description,
        author: img.user.name,
      }));
    }),
});

export type AppRouter = typeof appRouter;