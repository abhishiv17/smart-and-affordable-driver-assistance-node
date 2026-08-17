import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login - SADAN',
  description: 'Login to the SADAN Fleet Command Center',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SADAN</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Smart and Affordable Driver Assistance Node
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
