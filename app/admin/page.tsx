'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Loader2, Lock, Mail, Newspaper, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface EnvStatus {
  MONGODB_URI: string;
  JWT_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [isCheckingEnv, setIsCheckingEnv] = useState(true);

  useEffect(() => {
    // Check environment variables on mount
    const checkEnv = async () => {
      try {
        const res = await fetch('/api/debug/env');
        const data = await res.json();
        setEnvStatus(data.environment);
      } catch {
        console.error('Failed to check environment');
      } finally {
        setIsCheckingEnv(false);
      }
    };
    checkEnv();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.data.user);
        toast.success('Welcome back!');
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
        toast.error(data.error || 'Login failed');
      }
    } catch {
      setError('Login failed. Please check your connection.');
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setError(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        toast.success('Database seeded successfully!');
        toast.success(`Admin: ${data.data.admin.email} / ${data.data.admin.password}`, {
          duration: 10000,
        });
        setEmail(data.data.admin.email);
        setPassword(data.data.admin.password);
      } else {
        setError(data.error || 'Failed to seed database');
        toast.error(data.error || 'Failed to seed database');
      }
    } catch {
      setError('Failed to seed database. Please check your connection.');
      toast.error('Failed to seed database');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">NewsPortal Admin</h1>
          <p className="text-muted-foreground mt-1">Sign in to manage your news portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          {/* Environment Status */}
          {!isCheckingEnv && envStatus && envStatus.MONGODB_URI === 'NOT SET' && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Database Not Configured</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please configure MONGODB_URI in the Settings (Vars tab) to enable database features.
                    After setting the variable, refresh this page.
                  </p>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      {envStatus.MONGODB_URI.startsWith('Set') ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-500" />
                      )}
                      <span>MONGODB_URI: {envStatus.MONGODB_URI}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {envStatus.JWT_SECRET.startsWith('Set') ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-500" />
                      )}
                      <span>JWT_SECRET: {envStatus.JWT_SECRET}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@newsportal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Seed Database */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">
              First time? Initialize the database with sample data.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSeedDatabase}
              disabled={isSeeding}
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : (
                'Seed Database'
              )}
            </Button>
          </div>
        </div>

        {/* Back to site */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">
            Back to NewsPortal
          </a>
        </p>
      </div>
    </div>
  );
}
