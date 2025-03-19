'use client';

import { ArrowRight, Award, Building2, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Footer } from '@/app/layout/footer';
import { Navbar } from '@/app/layout/navbar';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export default function ProvidersPage() {
  return (
    <div className={manrope.className}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.25)',
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="flex items-center justify-start space-x-3 mb-8 animate-fade-in">
            <Building2 className="h-8 w-8 text-[#f08b8b]" />
            <span className="text-2xl font-medium">For Service Providers</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1] text-white animate-fade-in">
            Grow Your Business <br className="hidden md:block" />
            with <span className="text-transparent bg-clip-text bg-[radial-gradient(circle_farthest-corner_at_10%_20%,rgba(240,139,139,1)_0%,rgba(243,252,166,1)_90%)]">PlanSmart</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl text-gray-100 leading-relaxed animate-fade-in-delay">
            Join our platform to reach more clients, streamline your bookings, and expand your event service business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
            <Link href="/auth/provider-signup">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform duration-300 bg-[radial-gradient(circle_farthest-corner_at_10%_20%,rgba(240,139,139,1)_0%,rgba(243,252,166,1)_90%)] hover:bg-[radial-gradient(circle_farthest-corner_at_10%_20%,rgba(240,139,139,0.9)_0%,rgba(243,252,166,0.9)_90%)] text-gray-800 border-0"
              >
                Register your business <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/provider-signin">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white hover:scale-105 transition-all duration-300"
              >
                Sign in to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            Why Join Us?
          </h2>
          <p className="text-gray-600 text-center mb-20 text-lg max-w-2xl mx-auto">
            Join thousands of successful event service providers who have grown their business with PlanSmart.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-primary/10 to-fuchsia-500/10 rounded-xl p-4 w-fit mb-6 group-hover:from-primary/20 group-hover:to-fuchsia-500/20 transition-colors duration-300">
                  <benefit.icon className="h-8 w-8 text-[#f08b8b]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            How It Works
          </h2>
          <p className="text-gray-600 text-center mb-20 text-lg max-w-2xl mx-auto">
            Get started in just a few simple steps and begin growing your business today.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
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
                <div className="absolute -inset-1 bg-[radial-gradient(circle_farthest-corner_at_10%_20%,rgba(240,139,139,0.2)_0%,rgba(243,252,166,0.2)_90%)] rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-[radial-gradient(circle_farthest-corner_at_10%_20%,rgba(240,139,139,1)_0%,rgba(243,252,166,1)_90%)] text-gray-800 rounded-xl flex items-center justify-center text-xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

