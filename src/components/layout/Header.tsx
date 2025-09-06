// src/components/layout/Header.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <h1 className="text-xl font-bold">Insight Flow</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {session?.user?.email}
          </p>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}