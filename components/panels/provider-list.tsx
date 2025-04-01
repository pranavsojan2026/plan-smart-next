"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { providerSupabase } from "@/lib/supabase2";
import { toast } from "sonner";

// Update the Provider interface to match the table structure
interface Provider {
  id: string;
  provider_id: string;
  company_name: string;
  service_type: string;
  fees: string;
  location: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function EventProvidersList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // First check if user is authenticated
        const { data: sessionData, error: sessionError } = await providerSupabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          setError('Please sign in to view providers');
          toast.error('Authentication required');
          setLoading(false);
          return;
        }

        // Fetch providers data
        const { data, error } = await providerSupabase
          .from('provider_portfolios')
          .select(`
            id,
            provider_id,
            company_name,
            service_type,
            fees,
            location,
            description,
            contact_email,
            contact_phone,
            created_at,
            updated_at
          `);

        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
          toast.error(`Failed to load providers: ${error.message}`);
          return;
        }

        console.log('Fetched providers:', data);
        setProviders(data || []);
        setError(null);
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error occurred';
        console.error('Error fetching providers:', errorMessage);
        setError(errorMessage);
        toast.error(`Failed to load providers: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();

    // Set up real-time subscription
    const subscription = providerSupabase
      .channel('provider_portfolios_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'provider_portfolios'
        },
        (payload) => {
          // Refresh the data when changes occur
          fetchProviders();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Service Providers</h2>
        {loading && <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />}
      </div>

      {error ? (
        <Card className="p-6">
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden opacity-50">
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-1/4 bg-gray-200 rounded animate-pulse mt-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <Card className="p-6 text-center">
          <CardContent>
            <p className="text-muted-foreground">No service providers found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{provider.company_name || 'Unnamed Provider'}</CardTitle>
                <Badge variant="secondary" className="mt-2">
                  {provider.service_type || 'General Service'}
                </Badge>
                <CardDescription className="mt-2 line-clamp-2">
                  {provider.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {provider.location || 'Location not specified'}
                  </div>
                  {provider.contact_phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4" />
                      {provider.contact_phone}
                    </div>
                  )}
                  {provider.contact_email && (
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4" />
                      {provider.contact_email}
                    </div>
                  )}
                  <div className="text-sm font-medium">
                    Fees: {provider.fees || 'Not specified'}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Contact Provider
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventProvidersList;