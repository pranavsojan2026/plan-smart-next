'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Building2 } from 'lucide-react';
import { providerSupabase } from '@/lib/supabase2';
import { toast } from 'sonner';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export default function ProviderLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: signInError } = await providerSupabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      const { data: { session }, error: sessionError } = await providerSupabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (session) {
        localStorage.setItem('supabase.provider.token', session.access_token);
        
        // Fix: Query provider_profiles using the auth.uid() function or user_id field instead of id
        const { data: profileData, error: profileError } = await providerSupabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', session.user.id) // Changed from 'id' to 'user_id'
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
      }

      toast.success('Signed in successfully');
      router.push('/provider-dashboard');
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
          <div className="flex items-center justify-center mb-6 space-x-2">
            <Building2 className="h-6 w-6 text-[#f08b8b]" />
            <h2 className="text-2xl font-semibold text-gray-900">Service Provider Portal</h2>
          </div>
          <h2 className="text-center text-3xl font-bold mb-3 text-gray-900">Welcome back</h2>
          <p className="text-center text-lg text-gray-600 mb-8">
            New to PlanSmart?{' '}
            <Link href="/auth/provider-signup" className="text-[#f08b8b] hover:text-[#d67676]">
              Register your business
            </Link>
          </p>

          {/* Form Card */}
          <div className="bg-white p-8 sm:p-10 shadow-lg rounded-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 text-red-600 bg-red-50/50 backdrop-blur-sm rounded-xl">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f08b8b] focus:border-[#f08b8b] bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f08b8b] focus:border-[#f08b8b] bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link 
                    href="/auth/provider-forgot-password" 
                    className="text-[#f08b8b] hover:text-[#d67676]"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#f08b8b] hover:bg-[#d67676] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f08b8b] transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}