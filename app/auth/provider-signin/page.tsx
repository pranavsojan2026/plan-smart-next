'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ProviderLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Signed in successfully');
      router.push('/providers/dashboard');
      router.refresh();
    } catch (error) {
      toast.error('Error signing in');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-purple-500/5 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-20">
        <Link href="/" className="flex justify-center items-center group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Calendar className="relative h-12 w-12 text-primary transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="ml-3 text-2xl tracking-tight text-gray-900">
            <span className="font-aeonik-medium">Plan</span>
            <span className="font-aeonik-bold text-primary">Smart</span>
          </span>
        </Link>
        <div className="flex items-center justify-center mt-8 space-x-2">
          <Store className="h-6 w-6 text-primary" />
          <h2 className="text-center text-2xl font-aeonik-medium text-gray-900">
            Service Provider Portal
          </h2>
        </div>
        <h2 className="mt-4 text-center text-4xl font-aeonik-bold text-gray-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-3 text-center text-lg font-aeonik text-gray-600">
          New to PlanSmart?{' '}
          <Link href="/auth/provider-signup" className="font-aeonik-medium text-primary hover:text-primary/90 transition-colors">
            Register your business
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/70 backdrop-blur-xl py-10 px-8 shadow-xl rounded-2xl sm:px-12 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-aeonik-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl font-aeonik text-gray-900 placeholder:text-gray-400
                    transition-colors duration-200 bg-white/80
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-aeonik-medium text-gray-700">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl font-aeonik text-gray-900 placeholder:text-gray-400
                    transition-colors duration-200 bg-white/80
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full py-6 text-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/95 hover:to-purple-500/95 shadow-xl hover:shadow-primary/25"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}