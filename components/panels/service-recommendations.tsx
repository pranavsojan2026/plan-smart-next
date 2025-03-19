'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, UtensilsCrossed, Music, ArrowRight } from "lucide-react";
import Link from 'next/link';

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

export function ServiceRecommendationsPanel() {
  const [services] = useState<ServiceCard[]>([
    {
      id: 'venues',
      title: 'Venues',
      description: 'Discover perfect venues for your event',
      icon: <Building2 className="h-6 w-6 text-primary" />,
      link: '/venues'
    },
    {
      id: 'catering',
      title: 'Catering',
      description: 'Find top-rated catering services',
      icon: <UtensilsCrossed className="h-6 w-6 text-primary" />,
      link: '/catering'
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      description: 'Browse entertainment options',
      icon: <Music className="h-6 w-6 text-primary" />,
      link: '/entertainment'
    }
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Service Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-muted-foreground mb-4 flex-grow">{service.description}</p>
              <Link href={service.link}>
                <Button variant="outline" className="w-full group">
                  Browse {service.title}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}