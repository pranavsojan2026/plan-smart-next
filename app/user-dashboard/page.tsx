'use client';

import { Manrope } from 'next/font/google';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Sidebar } from '@/app/layout/sidebar';
import { EventOverviewPanel } from '@/components/panels/event-overview';
import { ServiceRecommendationsPanel } from '@/components/panels/service-recommendations';
import { VenueVisualizationPanel } from '@/components/panels/venue-visualization';
import { MessagingPanel } from '@/components/panels/messaging';
import { ProfilePanel } from '@/components/panels/profile';
import { NewEventForm } from '@/components/panels/new-event-form';
import { BudgetTrackerPanel } from '@/components/panels/budget-tracker';
import { AIAssistant } from "@/components/ai-asisstant"
import { EventProvidersList } from "@/components/panels/provider-list";

interface UserProfile {
  full_name: string;
  email: string;
  avatar_url?: string;
}

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export default function UserDashboardPage() {
  const [activePanel, setActivePanel] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Enhance the useEffect to handle session changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/user-signin');
          return;
        }

        const { user } = session;
        
        if (user) {
          setUserProfile({
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Error loading profile');
      }
    };

    fetchUserProfile();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/auth/user-signin');
        } else if (session) {
          setUserProfile({
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear all auth data
      localStorage.removeItem('supabase.auth.token');
      
      // Force a hard refresh to clear all state
      window.location.href = '/auth/user-signin';
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect to handle auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          window.location.href = '/auth/user-signin';
          return;
        }

        const { user } = session;
        
        if (user) {
          setUserProfile({
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Error loading profile');
        window.location.href = '/auth/user-signin';
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          window.location.href = '/auth/user-signin';
        } else if (session) {
          setUserProfile({
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const renderPanel = () => {
    switch (activePanel) {
      case 'new-event':
        return (
          <div className='max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-sm'>
            <div className='p-6 border-b'>
              <h2 className='text-2xl font-semibold'>Create New Event</h2>
            </div>
            <NewEventForm />
          </div>
        );
      case 'overview':
        return <EventOverviewPanel />;
      case 'budget':
        return <BudgetTrackerPanel />;
      case 'provider': // Add this case
        return <EventProvidersList />;
      case 'recommendations':
        return <ServiceRecommendationsPanel />;
      case 'venue':
        return <VenueVisualizationPanel />;
      case 'messaging':
        return <MessagingPanel />;
      case 'profile':
        return <ProfilePanel />;
      default:
        return <EventOverviewPanel />;
    }
  };

  return (
    <div className={`relative min-h-screen flex ${manrope.className}`}>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-[rgba(240,139,139,0.05)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_farthest-corner_at_10%_20%,rgba(240,139,139,0.05)_0%,rgba(243,252,166,0.05)_90%)] -z-10" />
      
      {/* Sidebar */}
      <Sidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        userProfile={userProfile}
        loading={loading}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#f08b8b]" />
            <span className="text-sm text-gray-600 font-medium">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activePanel === 'new-event' ? (
              <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-[radial-gradient(circle_farthest-corner_at_10%_20%,rgba(240,139,139,1)_0%,rgba(243,252,166,1)_90%)]">
                    Create New Event
                  </h2>
                </div>
                <NewEventForm />
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                {renderPanel()}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add AI Assistant */}
      <AIAssistant />
    </div>
  );
}
