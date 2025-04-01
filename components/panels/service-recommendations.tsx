"use client"

import { useState, useEffect } from "react"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const PIXABAY_API_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY

interface TrendingItem {
  id: number
  title: string
  description: string
  image: string
  trend_score: number
  tags: string[]
}

interface TrendingData {
  [key: string]: TrendingItem[]
}

const mockData: TrendingData = {
  photography: [],
  decor: [],
  food: []
}

const generateTrendTitle = (category: string, tags: string[]) => {
  const titleTemplates = {
    photography: [
      "Romantic Wedding Moments",
      "Elegant Bridal Portraits",
      "Timeless Wedding Memories",
      "Dreamy Wedding Photography",
      "Captivating Couples"
    ],
    decor: [
      "Elegant Design",
      "Stylish Arrangement",
      "Creative Setup",
      "Inspiring Decoration",
      "Aesthetic Masterpiece"
    ],
    food: [
      "Culinary Delight",
      "Gourmet Inspiration",
      "Delicious Creation",
      "Flavor Sensation",
      "Mouth-Watering Presentation"
    ]
  };

  const templates = titleTemplates[category as keyof typeof titleTemplates] || titleTemplates.photography;
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Use a tag or create a unique title
  const primaryTag = tags.length > 0 ? tags[0] : randomTemplate;
  return primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1);
}

export function ServiceRecommendationsPanel() {
  const [trendingData, setTrendingData] = useState<TrendingData>(mockData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("photography")

  useEffect(() => {
    fetchTrendingData()
  }, [])

  const fetchLatestImages = async (category: string) => {
    try {
      if (!PIXABAY_API_KEY) {
        throw new Error("Pixabay API key is missing")
      }

      const searchQueries: { [key: string]: string } = {
        photography: "wedding bride groom elegant romantic photoshoot professional",
        decor: "modern event decorations",
        food: "gourmet event catering",
      }

      const query = searchQueries[category] || category

      const response = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=10`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} images`)
      }

      const data = await response.json()
      return data.hits.map((item: any) => ({
        image: item.webformatURL,
        tags: item.tags.split(", "),
      }))
    } catch (error) {
      console.error(`Error fetching ${category} images:`, error)
      return []
    }
  }

  const fetchTrendingData = async (forceCategory?: string) => {
    try {
      setLoading(true)
      setError(null)

      const categories = forceCategory ? [forceCategory] : ["photography", "decor", "food"]
      const results: TrendingData = {}

      await Promise.all(
        categories.map(async (category) => {
          const images = await fetchLatestImages(category)

          results[category] = images.map((imageData, index) => ({
            id: Date.now() + index,
            title: generateTrendTitle(category, imageData.tags),
            description: category === "photography" 
              ? "Capturing the most romantic and elegant wedding moments" 
              : `Latest trending idea in ${category}.`,
            image: imageData.image || "/images/placeholder.jpg",
            trend_score: Math.floor(Math.random() * 30) + 70,
            tags: imageData.tags || ["New", "Trending", "2025"],
          }))
        })
      )

      // If forcing a specific category, only update that category
      if (forceCategory) {
        setTrendingData(prevData => ({
          ...prevData,
          [forceCategory]: results[forceCategory]
        }))
      } else {
        setTrendingData(results)
      }

      toast.success("Recommendations refreshed!")
    } catch (error) {
      console.error("Error fetching trending ideas:", error)
      toast.error("Failed to load recommendations")
      setError("Failed to load recommendations")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchTrendingData(activeCategory)
  }

  if (loading) {
    return <div className="text-center py-10">Loading trending ideas...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Latest Trending Ideas</h2>
        <div className="flex gap-4">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 border-rose-200">
            <TrendingUp className="h-4 w-4" />
            Updated Today
          </Badge>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="photography" 
        className="w-full"
        onValueChange={(value) => setActiveCategory(value)}
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="photography">Photography</TabsTrigger>
          <TabsTrigger value="decor">Decorations</TabsTrigger>
          <TabsTrigger value="food">Food & Catering</TabsTrigger>
        </TabsList>

        {Object.entries(trendingData).map(([category, items]) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fallbackSrc="/images/placeholder.jpg"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-rose-500">Trending {item.trend_score}%</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{item.title}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}