'use client';

import { CalendarCheck, Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center">
              <CalendarCheck className="h-8 w-8 text-primary" />
              <span className="ml-3 text-xl font-medium tracking-tight text-white">PlanSmart</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Streamline your event planning process with AI-powered recommendations and expert assistance.
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/providers" className="text-sm text-gray-400 hover:text-white transition-colors">For Providers</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>

              <div className="mt-8">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Connect</h3>
                <div className="flex space-x-5">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} PlanSmart. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <form className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 bg-gray-800 text-white px-4 py-2 text-sm rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary border-0"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-r-md hover:opacity-90 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
