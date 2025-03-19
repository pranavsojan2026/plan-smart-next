'use client';

import { ArrowRight, Calendar, Camera, MapPin, Utensils } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/app/layout/navbar';
import { Footer } from '@/app/layout/footer';

export default function HomePage() {
  return (
    <div>
      <Navbar />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center">
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.65)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/50" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-5xl md:text-7xl --font-manrope font-bold mb-8 text-white leading-[1.1] animate-fade-in">
              Plan Your Perfect <br className="hidden md:block" />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Event
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl text-gray-100 leading-relaxed animate-fade-in-delay">
              From weddings to corporate events, we help you create unforgettable moments with AI-powered recommendations and top-rated local services.
            </p>
            <Link href="/auth/user-signup">
              <Button 
                size="lg" 
                variant="default" 
                className="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform duration-300 animate-fade-in-delay-2"
              >
                Start Planning <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
              Everything You Need
            </h2>
            <p className="text-gray-600 text-center mb-20 text-lg max-w-2xl mx-auto">
              Our comprehensive suite of tools and services ensures your event planning journey is seamless and stress-free.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { icon: Calendar, title: 'Event Planning', description: 'Comprehensive planning tools and AI-powered recommendations' },
                { icon: MapPin, title: 'Venues', description: 'Discover perfect locations for any type of event' },
                { icon: Utensils, title: 'Catering', description: 'Connect with top-rated catering services' },
                { icon: Camera, title: 'Photography', description: 'Professional photographers for your special moments' }
              ].map((service, index) => (
                <div 
                  key={index} 
                  className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="bg-primary/5 rounded-xl p-4 w-fit mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

// Remove the extra navigation div at the bottom as it should be handled in the Navbar component
