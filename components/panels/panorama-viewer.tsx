"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { Pannellum } from "pannellum-react"

interface PanoramaViewerProps {
  imageUrl: string
}

export function PanoramaViewer({ imageUrl }: PanoramaViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="relative h-full w-full min-h-[300px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading 360° view...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <Pannellum
        width="100%"
        height="100%"
        image={imageUrl}
        pitch={10}
        yaw={180}
        hfov={110}
        autoLoad
        autoRotate={-2}
        compass={false}
        showControls={false}
        mouseZoom={true}
        onLoad={() => setIsLoading(false)}
        onError={(err: any) => {
          console.error("Panorama error:", err)
          setError("Failed to load panorama view")
          setIsLoading(false)
        }}
      />
    </div>
  )
}

