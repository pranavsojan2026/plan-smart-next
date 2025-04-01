"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Send, X, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import ReactMarkdown from "react-markdown"

// Use optional chaining to safely access environment variable
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

// Define a more strict type for the model
interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AIAssistant() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState<ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeModel = async () => {
      try {
        if (!GEMINI_API_KEY) {
          console.error('Gemini API key is not configured')
          return
        }
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const generativeModel = genAI.getGenerativeModel({ 
          model: "gemini-1.5-pro", // Changed from gemini-2.0-flash to gemini-pro
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        })
        setModel(generativeModel)
      } catch (error) {
        console.error("Error initializing model:", error)
      }
    }
    initializeModel()
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !model) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }])
    setIsLoading(true)

    try {
      const prompt = {
        contents: [
          {
            role: "assistant",
            parts: [
              { text: "You are Smartie, an AI assistant specialized in event planning. You help users plan and organize their events, including weddings, corporate events, and parties. You have expertise in budgeting, venue selection, vendor management, and timeline planning. Be friendly, professional, and provide practical advice." }
            ]
          },
          {
            role: "user",
            parts: [{ text: userMessage }]
          }
        ]
      }

      const result = await model.generateContent(prompt)
      const text = await result.response.text()

      setMessages(prev => [...prev, { role: "assistant", content: text, timestamp: new Date() }])
    } catch (error) {
      console.error("Error:", error)
      
      const errorMessage = error instanceof Error 
        ? (
            error.message.includes("API key") 
              ? "The AI service is not properly configured. Please check your environment variables."
            : error.message.includes("rate limit") 
              ? "The service is currently experiencing high demand. Please try again in a few moments."
            : error.message.includes("network") 
              ? "There seems to be a network connectivity issue. Please check your internet connection and try again."
            : "I apologize, but I encountered an error while processing your request."
          )
        : "An unexpected error occurred. Please try again."
  
      const errorAssistantMessage: Message = {
        role: "assistant", 
        content: errorMessage, 
        timestamp: new Date() 
      }
  
      setMessages((prev) => [...prev, errorAssistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm Smartie, your event planning assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ])
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hi! I'm Smartie, your event planning assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!user) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/95 hover:to-purple-500/95 p-0"
        >
          <Bot className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-96 h-[600px] flex flex-col shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold">Smartie</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="h-8 w-8"
                title="Clear chat"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                title="Minimize chat"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={`message-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className={`prose prose-sm ${
                          message.role === "user" ? "prose-invert" : ""
                        } max-w-none`}>
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className={`prose prose-sm list-disc ml-4 ${
                          message.role === "user" ? "prose-invert" : ""
                        } max-w-none`}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className={`prose prose-sm list-decimal ml-4 ${
                          message.role === "user" ? "prose-invert" : ""
                        } max-w-none`}>
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className={`prose prose-sm ${
                          message.role === "user" ? "prose-invert" : ""
                        } max-w-none`}>
                          {children}
                        </li>
                      ),
                      code: ({ children }) => (
                        <code className={`prose prose-sm ${
                          message.role === "user" ? "prose-invert" : ""
                        } max-w-none bg-muted px-1 rounded`}>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className={`prose prose-sm ${
                          message.role === "user" ? "prose-invert" : ""
                        } max-w-none bg-muted p-2 rounded overflow-x-auto`}>
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  <div className={`text-xs mt-1 ${
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground/70"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}