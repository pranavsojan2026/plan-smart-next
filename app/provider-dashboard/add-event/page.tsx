"use client"

import type React from "react"
import { useState } from "react"
import { providerSupabase } from "@/lib/supabase2"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Remove these imports
// import { useToast } from "@/components/ui/use-toast"
// import { Toaster } from "@/components/ui/toaster"
// import { toast } from "@/components/ui/use-toast"

// Add this import instead
import { toast } from "sonner";

export default function EventReminderForm({ onSuccess }: { onSuccess?: () => void }) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data: { session } } = await providerSupabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const formData = new FormData(e.target as HTMLFormElement);
      const eventData = {
        provider_id: session.user.id,
        event_name: formData.get('event_name'),
        event_type: formData.get('event_type'),
        event_date: formData.get('event_date'),
        start_time: formData.get('start_time'),
        end_time: formData.get('end_time'),
        location: formData.get('location'),
        customer_name: formData.get('customer_name'),
        customer_phone: formData.get('customer_phone'),
        customer_email: formData.get('customer_email'),
        notes: formData.get('notes'),
        status: 'pending'
      };

      const { error } = await providerSupabase
        .from('provider_events')
        .insert([eventData]);

      if (error) throw error;
      toast.success('Event added successfully'); // Changed from useToast to toast
      if (onSuccess) onSuccess();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event'); // Changed from useToast to toast
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="event_name">Event Name</Label>
          <Input id="event_name" name="event_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event_type">Event Type</Label>
          <Select name="event_type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="corporate">Corporate Event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="event_date">Date</Label>
          <Input type="date" id="event_date" name="event_date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input type="time" id="start_time" name="start_time" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input type="time" id="end_time" name="end_time" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer Name</Label>
          <Input id="customer_name" name="customer_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_phone">Customer Phone</Label>
          <Input id="customer_phone" name="customer_phone" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_email">Customer Email</Label>
          <Input type="email" id="customer_email" name="customer_email" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>
      <Button type="submit" className="w-full">Add Event</Button>
    </form>
  );
}

