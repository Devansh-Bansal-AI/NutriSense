"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { useProfile } from "@/context/profile-context"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const { profile } = useProfile()
  
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your NutriSense AI nutritionist. I can help you understand food labels, suggest healthy alternatives, or answer questions about your diet goals. How can I help today?"
    }
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setErrorMsg(null)

    // Setup for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantMessageId, role: "assistant", content: "" }])

    try {
      const payload = {
        messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        userProfile: profile
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to send message")
      }
      
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: msg.content + chunkValue }
            : msg
        ))
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      setErrorMsg(error.message)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: "Sorry, I'm having trouble connecting right now. Please try again later." }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">AI Nutritionist</h1>
        <p className="text-indigo-200">Ask anything about food, diets, or healthy habits.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden glass border-0 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
        
        <div className="flex-1 p-6 overflow-y-auto relative z-10 custom-scrollbar" ref={scrollRef}>
          <div className="space-y-8 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg border border-white/10 shrink-0 mt-1">
                    <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-3xl px-6 py-4 max-w-[85%] shadow-xl backdrop-blur-md border ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm border-white/10' 
                    : 'bg-black/40 text-indigo-50 rounded-tl-sm border-white/5'
                }`}>
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{m.content}</div>
                </div>

                {m.role === 'user' && (
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg border border-white/10 shrink-0 mt-1">
                    <AvatarFallback className="bg-transparent"><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start animate-in fade-in duration-300">
                <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg border border-white/10 shrink-0 mt-1">
                  <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="rounded-3xl px-6 py-5 bg-black/40 backdrop-blur-md border border-white/5 flex gap-2 items-center rounded-tl-sm shadow-xl">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="h-2 w-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="text-center p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-bold mx-8">
                Error: {errorMsg}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-xl relative z-10">
          <form onSubmit={handleSubmit} className="flex w-full gap-3 relative">
            <Input 
              placeholder="Ask about a diet, food, or habit..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-indigo-200/50 h-14 px-6 rounded-2xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500 text-lg shadow-inner"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              className="h-14 w-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105 shrink-0 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="h-6 w-6" />
            </Button>
          </form>
          <div className="text-center mt-3 text-xs font-semibold text-indigo-300/50 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" /> NutriSense AI can make mistakes. Always verify important nutrition facts.
          </div>
        </div>
      </Card>
    </div>
  )
}

