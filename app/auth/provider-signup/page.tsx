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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<string>('');
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

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    return hasMinLength && hasLowercase && hasUppercase && hasDigit && hasSpecialChar;
  };

  const checkPasswordStrength = (password: string) => {
    if (!password) return '';
    
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;
    
    if (strength === 0) feedback = 'Very weak';
    else if (strength === 1) feedback = 'Weak';
    else if (strength === 2) feedback = 'Fair';
    else if (strength === 3) feedback = 'Good';
    else if (strength === 4) feedback = 'Strong';
    else feedback = 'Very strong';
    
    return feedback;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
      
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: "Passwords do not match."
        }));
      } else if (formData.confirmPassword) {
        setFieldErrors(prev => {
          const updated = { ...prev };
          delete updated.confirmPassword;
          return updated;
        });
      }
    }
    
    if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: "Passwords do not match."
        }));
      } else {
        setFieldErrors(prev => {
          const updated = { ...prev };
          delete updated.confirmPassword;
          return updated;
        });
      }
    }
    
    if (error) setError(null);
  };

  const getInputClassName = (fieldName: string) => {
    return `mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f08b8b] focus:border-[#f08b8b] bg-white/50 backdrop-blur-sm ${
      fieldErrors[fieldName] ? 'border-red-500 bg-red-50' : ''
    }`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      // Validate all required fields
      if (!formData.email || !formData.password || !formData.companyName || !formData.serviceType) {
        throw new Error('All fields are required');
      }

      // Validate password requirements
      if (!validatePassword(formData.password)) {
        setFieldErrors(prev => ({
          ...prev,
          password: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
        }));
        throw new Error('Password does not meet requirements');
      }

      // Validate password confirmation
      if (formData.password !== formData.confirmPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: "Passwords do not match."
        }));
        throw new Error('Passwords do not match');
      }

      // Sign up the user with providerSupabase
      const { data, error: authError } = await providerSupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            company_name: formData.companyName,
            service_type: formData.serviceType,
            user_type: 'provider'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;
      if (!data.user?.id) throw new Error('No user ID returned from signup');

      // Create provider profile with RLS-compatible approach
      const { error: profileError } = await providerSupabase
        .from('provider_profiles')
        .insert([{
          provider_id: data.user.id,
          company_name: formData.companyName,
          service_type: formData.serviceType,
          email: formData.email,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      // Continue with success flow even if there's a profile error
      // since the auth account is created successfully
      toast.success('Account created successfully! Please check your email to verify your account.');
      router.push('/auth/provider-signin');

    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Failed to create account';
      
      // Parse error message
      if (typeof error === 'object' && error !== null) {
        if (error.message) {
          errorMessage = error.message;
          
          // Handle common Supabase error messages
          if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please sign in or use a different email.';
          } else if (error.message.includes('rate limit')) {
            errorMessage = 'Too many attempts. Please try again later.';
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Please enter a valid email address.';
          }
        }
      }
      
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
                  className={getInputClassName('companyName')}
                  placeholder="Enter your company name"
                />
                {fieldErrors.companyName && <p className="mt-1 text-xs text-red-500">{fieldErrors.companyName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Service Type</label>
                <select
                  name="serviceType"
                  required
                  value={formData.serviceType}
                  onChange={handleChange}
                  className={getInputClassName('serviceType')}
                >
                  <option value="">Select your service type</option>
                  {serviceTypes.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
                {fieldErrors.serviceType && <p className="mt-1 text-xs text-red-500">{fieldErrors.serviceType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClassName('email')}
                  placeholder="Enter your email"
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={getInputClassName('password')}
                  placeholder="Create a password"
                />
                {passwordStrength && (
                  <div className="mt-1 flex items-center">
                    <div className={`h-1 flex-grow rounded ${
                      passwordStrength === 'Very weak' || passwordStrength === 'Weak' ? 'bg-red-500' :
                      passwordStrength === 'Fair' ? 'bg-yellow-500' :
                      passwordStrength === 'Good' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <span className="ml-2 text-xs text-gray-500">{passwordStrength}</span>
                  </div>
                )}
                {fieldErrors.password ? (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters with uppercase, lowercase, number, and special character</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={getInputClassName('confirmPassword')}
                  placeholder="Confirm your password"
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                )}
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