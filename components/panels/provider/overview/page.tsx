"use client";

import { useState, useEffect } from "react";
import { providerSupabase } from "@/lib/supabase2";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Home, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EventReminderForm from "@/app/provider-dashboard/add-event/page";

interface Event {
  id: string;
  provider_id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export default function EventOverview() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription;

    const fetchEvents = async () => {
      try {
        const { data: { session } } = await providerSupabase.auth.getSession();
        if (!session) {
          setError('Please sign in to view events');
          setLoading(false);
          return;
        }

        // Initial data fetch
        await fetchLatestEvents(session.user.id);

        // Set up real-time subscription
        subscription = providerSupabase
          .channel('provider_events_channel')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'provider_events',
              filter: `provider_id=eq.${session.user.id}`
            },
            (payload) => {
              // Update events when changes occur
              fetchLatestEvents(session.user.id);
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up events subscription:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    };

    const fetchLatestEvents = async (userId: string) => {
      try {
        const { data, error: fetchError } = await providerSupabase
          .from('provider_events')
          .select('*')
          .eq('provider_id', userId)
          .order('event_date', { ascending: true });

        if (fetchError) throw fetchError;
        setEvents(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Cleanup subscription on component unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleAddEvent = () => {
    setShowEventForm(true);
  };

  const handleBackToOverview = () => {
    setShowEventForm(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await providerSupabase
        .from('provider_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Event deleted successfully');
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
    }
  };

  // If showing form, render EventReminderForm
  if (showEventForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight font-aeonik-medium">Add New Event</h2>
          <Button variant="outline" onClick={handleBackToOverview}>
            Back to Overview
          </Button>
        </div>
        <EventReminderForm onSuccess={handleBackToOverview} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight font-aeonik-medium">Upcoming Events</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="font-aeonik">Filter</Button>
          <Button className="font-aeonik" onClick={handleAddEvent}>Add New Event</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">Loading events...</div>
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-500">{error}</p>
        </Card>
      ) : events.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No events found. Create your first event!</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{event.event_name}</CardTitle>
                    <CardDescription>{event.event_type}</CardDescription>
                  </div>
                  <Badge variant={
                    event.status === 'confirmed' ? 'default' :
                    event.status === 'pending' ? 'secondary' :
                    event.status === 'cancelled' ? 'destructive' : 'outline'
                  }>
                    {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(event.event_date).toLocaleDateString()} • {event.start_time} - {event.end_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location || 'No location specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Contact: {event.customer_name || 'Unknown'} {event.customer_phone ? `(${event.customer_phone})` : ''}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex gap-2">
                
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteEvent(event.id)}
                  className="flex-none"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}