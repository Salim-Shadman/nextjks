// src/components/TrpcProvider.tsx
'use client';
import { trpc } from '@/lib/trpc';

const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default trpc.withTRPC(TrpcProvider);