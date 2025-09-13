'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { AuthProvider } from '@/components/AuthProvider';
import { TrpcProvider } from '@/components/TrpcProvider';
import { Toaster } from 'sonner';

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <AuthProvider>
        <TrpcProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TrpcProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}