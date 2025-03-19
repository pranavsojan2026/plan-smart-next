'use client';

import { ArrowRight, Award, Building2, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Footer } from '@/app/layout/footer';


export default function ProvidersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="flex items-center justify-start space-x-3 mb-8">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-aeonik-medium">For Service Providers</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-aeonik-bold mb-8 leading-[1.1] text-white">
            Grow Your Business <br className="hidden md:block" />
            with <span className="text-primary">PlanSmart</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl text-gray-200 font-aeonik leading-relaxed">
            Join our platform to reach more clients, streamline your bookings, and expand your event service business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/provider-signup">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/95 hover:to-purple-500/95 shadow-xl hover:shadow-primary/25"
              >
                Register your business <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/provider-signin">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white"
              >
                Sign in to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-aeonik-bold text-center mb-4">Why Join Us?</h2>
          <p className="text-gray-600 text-center mb-16 text-lg font-aeonik max-w-2xl mx-auto">
            Join thousands of successful event service providers who have grown their business with PlanSmart.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Reach More Clients',
                description: 'Connect with thousands of event planners actively looking for services like yours.'
              },
              {
                icon: Award,
                title: 'Build Your Brand',
                description: 'Showcase your work and build your reputation with verified reviews and a professional profile.'
              },
              {
                icon: CheckCircle,
                title: 'Easy Management',
                description: 'Streamline your bookings, communicate with clients, and manage your business all in one place.'
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group">
                <div className="bg-primary/5 rounded-xl p-4 w-fit mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-aeonik-medium mb-3">{benefit.title}</h3>
                <p className="text-gray-600 font-aeonik">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-aeonik-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-600 text-center mb-16 text-lg font-aeonik max-w-2xl mx-auto">
            Get started in just a few simple steps and begin growing your business today.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Sign up and create your professional business profile'
              },
              {
                step: '2',
                title: 'Add Your Services',
                description: 'List your services with detailed pricing and availability'
              },
              {
                step: '3',
                title: 'Get Bookings',
                description: 'Receive and manage booking requests from clients'
              },
              {
                step: '4',
                title: 'Grow Your Business',
                description: 'Build your reputation and expand your client base'
              }
            ].map((item, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl flex items-center justify-center text-xl font-aeonik-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-aeonik-medium mb-3">{item.title}</h3>
                  <p className="text-gray-600 font-aeonik">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Footer */}
      <Footer />
    </div>
  );
}

