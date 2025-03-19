'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarCheck } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with persistent session
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true // This ensures the session persists
        }
      });

      if (signInError) throw signInError;

      // Set up session persistence in local storage
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Store session in local storage
        localStorage.setItem('supabase.auth.token', session.access_token);
      }

      toast.success('Signed in successfully');
      router.push('/user-dashboard');
      router.refresh();
    } catch (error: any) {
      console.error('Sign-in error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error.message) {
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Invalid email or password';
            break;
          case 'Email not confirmed':
            errorMessage = 'Please verify your email first';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-gray-50 to-white py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-20">
        <Link href="/" className="flex justify-center items-center group">
          <CalendarCheck className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="ml-3 text-2xl tracking-tight text-gray-900">
            <span className="font-bold">Plan</span>
            <span className="text-primary">Smart</span>
          </span>
        </Link>
        <h2 className="mt-8 text-center text-4xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="mt-3 text-center text-lg text-gray-600">
          Don't have an account? <Link href="/auth/user-signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white p-10 shadow-xl rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
              </div>
            </div>
            <div>
              <Button type="submit" className="w-full py-4 text-lg bg-primary text-white rounded-xl" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
