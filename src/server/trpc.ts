// src/server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import superjson from 'superjson';
import { ZodError } from 'zod';

// Context is created for each request and is available in all procedures
export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions);
  return {
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const middleware = t.middleware;

// Unprotected procedure for public use
export const publicProcedure = t.procedure;

// Middleware to enforce user authentication
const enforceUserIsAuthed = middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Protected procedure for authenticated users
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);