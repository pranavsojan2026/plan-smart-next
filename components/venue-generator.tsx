"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateVenueImage } from "@/lib/generate-venue";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function VenueGenerator() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Please enter a venue description");
      return;
    }

    setLoading(true);
    try {
      const result = await generateVenueImage(description);
      
      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || "Failed to generate image");
      }

      setGeneratedImage(result.imageUrl);
      toast.success("Venue image generated successfully!");
    } catch (error) {
      toast.error("Failed to generate venue image");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Describe your ideal venue..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="w-full"
      />
      
      <Button 
        onClick={handleGenerate}
        disabled={loading || !description.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Venue Image'
        )}
      </Button>

      {generatedImage && (
        <div className="mt-4">
          <img 
            src={generatedImage} 
            alt="Generated venue"
            className="w-full rounded-lg shadow-lg" 
          />
        </div>
      )}
    </div>
  );
}