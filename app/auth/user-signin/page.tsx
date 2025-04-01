'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarCheck } from 'lucide-react';
import { userSupabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Add better error handling in the handleSubmit function
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const { data, error: signInError } = await userSupabase.auth.signInWithPassword({
        email,
        password
      });
  
      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error('An error occurred during sign in. Please try again.');
        }
        return;
      }
  
      if (data?.user) {
        toast.success('Signed in successfully');
        router.push('/user-dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center ${manrope.className} bg-gray-50`}>
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo Section */}
          <Link href="/" className="flex justify-center items-center group mb-12">
            <div className="relative">
              <CalendarCheck className="h-12 w-12 text-[#f08b8b] transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="ml-3 text-2xl tracking-tight text-gray-900">
              <span className="font-bold">Plan</span>
              <span className="text-[#f08b8b]">Smart</span>
            </span>
          </Link>

          {/* Title Section */}
          <h2 className="text-center text-4xl font-bold mb-3 text-gray-900">
            Welcome back
          </h2>
          <p className="text-center text-lg text-gray-600 mb-8">
            Don't have an account? <Link href="/auth/user-signup" className="text-[#f08b8b] hover:text-[#d67676]">Sign up</Link>
          </p>

          {/* Form Card */}
          <div className="bg-white p-8 sm:p-10 shadow-lg rounded-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <div className="p-4 text-red-600 bg-red-50/50 backdrop-blur-sm rounded-xl">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f08b8b] focus:border-[#f08b8b] bg-white/50 backdrop-blur-sm"
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
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f08b8b] focus:border-[#f08b8b] bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/forgot-password" className="text-[#f08b8b] hover:underline">Forgot password?</Link>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#f08b8b] hover:bg-[#d67676] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f08b8b] transition-colors duration-200"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
