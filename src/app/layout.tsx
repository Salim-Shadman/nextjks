import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/Providers";

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
      <body className={`${GeistSans.className}`}>
        <Providers
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}