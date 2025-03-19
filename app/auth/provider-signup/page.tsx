'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Building2 } from 'lucide-react';
import { providerSupabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Manrope } from 'next/font/google';
import { PostgrestError } from '@supabase/supabase-js';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

interface SignupError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export default function ProviderSignupPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    serviceType: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SignupError | null>(null);
  const router = useRouter();

  // Service type options
  const serviceTypes = [
    'Wedding Planning',
    'Corporate Events',
    'Birthday Parties',
    'Catering',
    'Venue Rental',
    'Photography',
    'Videography',
    'Entertainment',
    'Decoration',
    'Transportation',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const logError = (phase: string, error: any) => {
    console.error(`Error during ${phase}:`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status: error.status,
      stack: error.stack
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Input validation
      if (!formData.email || !formData.password || !formData.companyName || !formData.serviceType) {
        throw new Error('All fields are required');
      }

      // Step 1: Sign up
      console.log('Starting authentication...');
      const { data: { user }, error: authError } = await providerSupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            company_name: formData.companyName,
            service_type: formData.serviceType,
            user_type: 'provider'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!user?.id) {
        throw new Error('No user ID returned from signup');
      }

      console.log('Authentication successful, user created:', { userId: user.id });

      // Step 2: Create profile - with more detailed error handling
      console.log('Attempting to create profile with data:', {
        userId: user.id,
        companyName: formData.companyName,
        serviceType: formData.serviceType,
        email: formData.email
      });

      const { data: profileData, error: profileError, status } = await providerSupabase
        .from('provider_profiles')
        .insert({
          id: user.id,
          company_name: formData.companyName,
          service_type: formData.serviceType,
          email: formData.email,
          status: 'pending'
        })
        .select('*')
        .single();

      // Log the complete response
      console.log('Profile creation response:', {
        success: !!profileData,
        error: profileError,
        status,
        data: profileData
      });

      if (profileError) {
        console.error('Profile creation error details:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint
        });
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      if (!profileData) {
        throw new Error('Profile was created but no data was returned');
      }

      console.log('Profile created successfully:', profileData);
      toast.success('Account created successfully! Please check your email to verify your account.');
      router.push('/auth/provider-signin');

    } catch (error: any) {
      console.error('Signup process failed with error:', {
        error,
        message: error.message,
        name: error.name,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        status: error?.status
      });

      const errorMessage = error.message || 'Failed to create account';
      setError({
        message: errorMessage,
        details: error?.details || null,
        hint: error?.hint || null,
        code: error?.code || null
      });
      
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
          <h2 className="text-center text-3xl font-bold mb-3 text-gray-900">Register your business</h2>
          <p className="text-center text-lg text-gray-600 mb-8">
            Already have an account?{' '}
            <Link href="/auth/provider-signin" className="text-[#f08b8b] hover:text-[#d67676]">
              Sign in
            </Link>
          </p>

          {/* Form Card */}
          <div className="bg-white p-8 sm:p-10 shadow-lg rounded-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 text-red-600 bg-red-50/50 backdrop-blur-sm rounded-xl">
                  <p className="font-medium">{error.message}</p>
                  {error.hint && (
                    <p className="text-sm mt-1 text-red-500">{error.hint}</p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f08b8b] focus:border-[#f08b8b] bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Service Type</label>
                <select
                  name="serviceType"
                  required
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f08b8b] focus:border-[#f08b8b] bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Select your service type</option>
                  {serviceTypes.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
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
                  placeholder="Create a password"
                />
                <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f08b8b] focus:border-[#f08b8b] bg-white/50 backdrop-blur-sm"
                  placeholder="Confirm your password"
                />
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
                    Creating account...
                  </span>
                ) : (
                  'Register Business'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}