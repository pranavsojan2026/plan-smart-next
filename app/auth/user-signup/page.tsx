'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { userSupabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const router = useRouter();

  // Validates that full name contains only letters and spaces
  const validateFullName = (name: string) => {
    // This regex ensures only letters (A-Z, a-z) and spaces are allowed
    return /^[A-Za-z ]+$/.test(name);
  };
  
  // Validates password strength requirements
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    return hasMinLength && hasLowercase && hasUppercase && hasDigit && hasSpecialChar;
  };

  // Calculate password strength and return feedback
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    
    let hasErrors = false;

    // Validate full name (letters and spaces only)
    if (!validateFullName(formData.fullName)) {
      setFieldErrors(prev => ({
        ...prev,
        fullName: "Full name can only contain letters and spaces. No numbers or symbols allowed."
      }));
      hasErrors = true;
    }

    // Validate email format
    if (!formData.email.includes('@')) {
      setFieldErrors(prev => ({
        ...prev,
        email: "Please enter a valid email address."
      }));
      hasErrors = true;
    }

    // Validate password strength
    if (!validatePassword(formData.password)) {
      setFieldErrors(prev => ({
        ...prev,
        password: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      }));
      hasErrors = true;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: "Passwords do not match."
      }));
      hasErrors = true;
    }

    if (hasErrors) {
      setError("Please correct the errors in the form.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await userSupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: 'user'
          }
        }
      });

      if (error) throw error;

      toast.success('Account created successfully! Please check your email to verify your account.');
      router.push('/auth/user-signin');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during registration.';
      
      // Handle Supabase-specific errors
      if (error.message) {
        switch (error.message) {
          case 'User already registered':
            errorMessage = 'This email is already registered. Please sign in instead.';
            break;
          case 'Invalid email':
            errorMessage = 'Invalid email address format.';
            break;
          case 'Weak password':
            errorMessage = 'Password is too weak. Please choose a stronger password.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific error when typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    // Field-specific validations on change
    if (name === 'fullName') {
      // Real-time validation for full name
      if (value && !validateFullName(value)) {
        setFieldErrors(prev => ({
          ...prev,
          fullName: "Full name can only contain letters and spaces. No numbers or symbols allowed."
        }));
      }
    }
    
    // Check password strength on change
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
      
      // Update confirm password validation if it's already been entered
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
    
    // Validate confirm password as user types
    if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: "Passwords do not match."
        }));
      }
    }
    
    // Clear general error when typing
    if (error) setError(null);
  };

  const getInputClassName = (fieldName: string) => {
    return `mt-1 p-3 w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
      fieldErrors[fieldName] ? 'border-red-500 bg-red-50' : ''
    }`;
  };

  return (
    <div className={`min-h-screen flex flex-col ${manrope.className} bg-gray-50`}>
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
            <ClipboardList className="h-6 w-6 text-[#f08b8b]" />
          <h2 className="text-2xl font-semibold text-gray-900">Event Planner Portal</h2>
        </div>
          <h2 className="text-center text-3xl font-bold mb-3 text-gray-900">
            Register as an Event Planner
          </h2>
          <p className="text-center text-lg text-gray-600 mb-8">
          Already have an account?{' '}
            <Link href="/auth/user-signin" className="text-[#f08b8b] hover:text-[#d67676]">Sign in</Link>
        </p>

          {/* Form Card */}
          <div className="bg-white p-8 sm:p-10 shadow-lg rounded-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">{error}</div>}
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                id="fullName" 
                name="fullName" 
                type="text" 
                required 
                value={formData.fullName} 
                onChange={handleChange} 
                className={getInputClassName('fullName')}
                placeholder="Enter your full name" 
              />
              {fieldErrors.fullName ? (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Only letters and spaces allowed. No numbers or symbols.</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                id="email" 
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                id="password" 
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input 
                id="confirmPassword" 
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#f08b8b] hover:bg-[#d67676] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f08b8b] transition-colors duration-200"
            >
              {loading ? 'Signing up...' : 'Sign up'}
              </button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}