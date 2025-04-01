"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Loader2, ImageIcon } from "lucide-react"

import { generateVenueImage } from "@/lib/generate-venue"

const eventTypes = [
  { id: "wedding", label: "Wedding Venue" },
  { id: "corporate", label: "Corporate Event" },
  { id: "birthday", label: "Birthday Party" },
  { id: "conference", label: "Conference Hall" },
  { id: "outdoor", label: "Outdoor Event" },
  { id: "custom", label: "Custom Venue" },
]

export function VenueVisualizationPanel() {
  const [prompt, setPrompt] = useState("")
  const [eventType, setEventType] = useState("wedding")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      setError("Please enter a description for your venue")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const fullPrompt = eventType === "custom" ? prompt : `${eventType} venue: ${prompt}`
      const result = await generateVenueImage(fullPrompt)

      if (!result.success) {
        throw new Error(result.error)
      }

      setGeneratedImage(result.imageUrl)
    } catch (err) {
      setError("Failed to generate venue image. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Describe Your Ideal Venue</Label>
            <Textarea
              id="prompt"
              placeholder="A luxurious ballroom with crystal chandeliers, marble floors, and elegant table settings for 200 guests..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Suggestions</Label>
            <div className="flex flex-wrap gap-2">
              {["elegant", "rustic", "modern", "beach", "garden", "industrial", "minimalist", "luxury"].map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(prompt ? `${prompt}, ${tag} style` : `${tag} style`)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Venue...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Venue
              </>
            )}
          </Button>
        </form>
      </Card>

      <div className="flex flex-col space-y-4">
        <Card className="flex-1 overflow-hidden">
          {generatedImage ? (
            <div className="relative h-full w-full">
              <img 
                src={generatedImage} 
                alt="Generated venue"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">No Venue Generated Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter a description and click "Generate Venue" to create your custom event space
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}