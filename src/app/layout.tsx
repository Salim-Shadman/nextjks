// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import TrpcProvider from '@/components/TrpcProvider'; // Correctly import the default export
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Insight Flow',
  description: 'An Interactive Data Storytelling & Visualization SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body>
        <AuthProvider>
          <TrpcProvider>{children}</TrpcProvider>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}