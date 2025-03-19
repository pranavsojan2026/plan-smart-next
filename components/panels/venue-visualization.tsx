'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Image as ImageIcon, Upload } from "lucide-react";

export function VenueVisualizationPanel() {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [layout, setLayout] = useState<string | null>(null);

  const handleVenueSelect = (venueId: string) => {
    setSelectedVenue(venueId);
    // Here you would typically fetch the venue layout from your backend
    setLayout('/placeholder-layout.jpg');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Venue Visualization</h2>
      <Card className="p-6 aspect-video">
        {!selectedVenue ? (
          <div className="h-full flex flex-col items-center justify-center bg-muted rounded-lg">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Select a venue to visualize layout</p>
            <Button variant="outline" onClick={() => handleVenueSelect('demo-venue')}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Load Demo Layout
            </Button>
          </div>
        ) : (
          <div className="h-full relative">
            {layout ? (
              <img
                src={layout}
                alt="Venue Layout"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p>Loading layout...</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}