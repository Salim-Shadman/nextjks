// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { TrpcProvider } from '@/components/TrpcProvider';
import { Toaster } from 'sonner'; // Corrected import path

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
          <TrpcProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TrpcProvider>
        </AuthProvider>
      </body>
    </html>
  );
}