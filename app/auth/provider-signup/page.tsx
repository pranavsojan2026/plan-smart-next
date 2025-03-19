'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Building2 } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { toast } from 'sonner';

export default function ProviderSignupPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    serviceType: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation checks
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with company name
      await updateProfile(userCredential.user, {
        displayName: formData.companyName
      });

      // You might want to store additional provider data in your database here
      // For example: service type, company details, etc.

      toast.success('Account created successfully');
      router.push('/provider-dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-purple-500/5 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-20">
        <Link href="/" className="flex justify-center items-center group">
          <CalendarCheck className="h-12 w-12 text-primary" />
          <span className="ml-3 text-2xl font-bold text-gray-900">PlanSmart</span>
        </Link>
        <div className="flex items-center justify-center mt-8 space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-center text-2xl font-medium text-gray-900">Service Provider Portal</h2>
        </div>
        <h2 className="mt-4 text-center text-4xl font-bold text-gray-900">Register your business</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Company Name Field */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter your company name"
              />
            </div>

            {/* Service Type Field */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Event Planning Service</label>
              <select
                id="serviceType"
                name="serviceType"
                required
                value={formData.serviceType}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="" disabled>Select your service type</option>
                {serviceTypes.map((service, index) => (
                  <option key={index} value={service}>{service}</option>
                ))}
              </select>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Create a password"
              />
              <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Confirm your password"
              />
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Register Business
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/provider-login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}