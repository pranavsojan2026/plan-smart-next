'use client';

import { CalendarCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/70 backdrop-blur-xl border-b border-gray-100/50 z-50 font-aeonik">
      <div className="w-full px-2 sm:px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Left Side */}
          <Link href="/" className="flex items-center group pl-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CalendarCheck className="relative h-8 w-8 text-primary transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="ml-3 text-xl tracking-tight text-gray-900">
              <span className="font-aeonik-medium">Plan</span>
              <span className="font-aeonik-bold text-primary">Smart</span>
            </span>
          </Link>

          {/* Navigation Links - Right Side */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/providers" className="text-[15px] font-aeonik text-gray-600 hover:text-primary transition-all duration-300 hover:scale-105">
              For Providers
            </Link>
            <Link href="/auth/user-signin">
              <Button variant="outline" className="font-aeonik-medium">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/user-signup">
              <Button className="font-aeonik-medium bg-gradient-to-r from-primary to-purple-500 hover:from-primary/95 hover:to-purple-500/95">
                Sign up
              </Button>
            </Link>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-lg">
              <div className="px-4 pt-3 pb-4">
                <Link href="/providers/index" className="block px-4 py-3 text-[15px] font-aeonik text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-300">
                  For Providers
                </Link>
                <div className="px-4 py-3 space-y-3">
                  <Link href="/auth/user-signup/user-signin">
                    <Button variant="outline" className="w-full font-aeonik-medium justify-center">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/user-signup">
                    <Button className="w-full font-aeonik-medium justify-center bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85">
                      Sign up
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20 transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}