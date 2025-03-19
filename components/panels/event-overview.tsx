"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Event {
  id: string;
  created_at: string;
  name: string;
  type: string;
  venue_type: string;
  budget: number;
  guest_count: number;
  status: string;
}

export function EventOverviewPanel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Fetch initial events
    async function fetchEvents() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: eventsList, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEvents(eventsList || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    // Set up real-time subscription
    const channel = supabase
      .channel('events_channel')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'events'
        }, 
        async (payload) => {
          // Refresh the events list when changes occur
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: updatedEvents } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          setEvents(updatedEvents || []);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const upcomingEvents = events.filter(event => event.status === "pending");
  const recentActivity = events.slice(0, 3);

  // Add delete handler
  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const { error } = await supabase
        .rpc('delete_event', {
          event_id: eventId,
          auth_user_id: user.id
        });

      if (error) throw error;

      // Update local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast.success(`Event "${eventName}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground font-aeonik">Event Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-aeonik">Registered Events</h3>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{event.name}</p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{event.type}</span>
                        <span>{event.venue_type}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>Guests: {event.guest_count}</span>
                        <span className="mx-2">•</span>
                        <span>Budget: ₹{event.budget}</span>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the event "{event.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteEvent(event.id, event.name)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No upcoming events scheduled</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-aeonik">Recent Activity</h3>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map(event => (
                <div key={event.id} className="text-sm">
                  <p className="font-medium">{event.name}</p>
                  <p className="text-muted-foreground">
                    Created {formatDistance(new Date(event.created_at), new Date(), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-aeonik">Quick Stats</h3>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-sm text-muted-foreground">Pending Events</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                ₹{events.reduce((sum, event) => sum + Number(event.budget), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Budget</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
