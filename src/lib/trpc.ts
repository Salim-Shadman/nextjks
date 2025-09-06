import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from '@/server';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { getBaseUrl } from './getBaseUrl';

// Client for React components (hooks)
export const trpc = createTRPCReact<AppRouter>();

// Client specifically for use in Server Components
export const serverClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});