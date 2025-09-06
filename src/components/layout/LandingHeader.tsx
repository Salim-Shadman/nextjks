// src/components/layout/LandingHeader.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { LogIn } from "lucide-react";

export async function LandingHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Insight Flow
        </Link>
        {session ? (
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <Button asChild variant="ghost">
            <Link href="/api/auth/signin">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}