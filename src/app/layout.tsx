import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans"; // এই লাইনটি যোগ করুন
import { AuthProvider } from "@/components/AuthProvider";
import { TrpcProvider } from "@/components/TrpcProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Insight Flow",
  description: "An Interactive Data Storytelling & Visualization SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} dark`}>
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