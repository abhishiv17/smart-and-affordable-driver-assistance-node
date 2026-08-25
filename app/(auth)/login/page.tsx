import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login - SADAN',
  description: 'Login to the SADAN Fleet Command Center',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Geometric decoration */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-12">
        <div>
          <Link href="/" className="text-sm font-bold tracking-[0.2em] uppercase hover:opacity-80 transition-opacity">
            SADAN
          </Link>
        </div>

        <div>
          <h2 className="text-4xl font-bold tracking-tight uppercase leading-[1.1] mb-6">
            Your Business.
            <br />
            One Intelligent
            <br />
            Space.
          </h2>
          <p className="text-sm opacity-60 max-w-sm">
            See everything. Simulate anything. Act with confidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Bauhaus geometric shapes */}
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#D94A38' }} />
          <div className="w-8 h-8" style={{ backgroundColor: '#E7B83E' }} />
          <div className="w-8 h-8" style={{ backgroundColor: '#3157A5', borderRadius: '0 50% 50% 0' }} />
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-sm font-bold tracking-[0.2em] uppercase text-foreground hover:opacity-80 transition-opacity">
              SADAN
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              Sign In
            </h1>
            <span className="sadan-accent-line" />
            <p className="mt-3 text-sm text-muted-foreground">
              Enter your credentials to access the command center.
            </p>
          </div>
          
          <LoginForm />

          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] text-center pt-4">
            MSME Hackathon 6.0
          </p>
        </div>
      </div>
    </div>
  );
}
