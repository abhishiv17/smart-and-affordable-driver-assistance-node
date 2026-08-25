'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.refresh();
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div
          className="flex items-start gap-2 text-sm p-3 border"
          style={{
            borderColor: 'var(--color-sadan-critical)',
            color: 'var(--color-sadan-critical)',
            borderRadius: 'var(--radius)',
          }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-1.5">
        <Label htmlFor="email" className="sadan-label">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="admin@sadan.fleet" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="sadan-label">Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
      </div>

      <Button type="submit" className="w-full uppercase tracking-wider font-semibold" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {loading ? 'Authenticating...' : 'Enter SADAN →'}
      </Button>
    </form>
  );
}
