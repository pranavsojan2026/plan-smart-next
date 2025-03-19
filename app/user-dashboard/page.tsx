'use client';

// Add useEffect import
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

interface UserProfile {
  full_name: string;
  email: string;
  avatar_url?: string;
}

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
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      
      // Redirect to sign-in page
      router.push('/auth/user-signin');
      router.refresh();
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

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
    <div className='relative min-h-screen flex'>
      {/* Background */}
      <div className='fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-primary/5 -z-10' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10' />
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent -z-10' />
      
      {/* Sidebar */}
      <Sidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        userProfile={userProfile}
        loading={loading}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <header className='flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6'>
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>
        <main className='flex-1 p-6'>{renderPanel()}</main>
      </div>
    </div>
  );
}
