'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
        onClick={handleLogout}
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10",
        collapsed && "justify-center"
      )}
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4 shrink-0" />
      <span>Log out</span>
    </Button>
  );
}
