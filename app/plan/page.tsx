"use client"

import { useState, useEffect } from "react"
import { AIResponseProcessor } from "@/lib/ai-response-processor"
import { RepoHeader } from "@/components/repo-header"
import { ChatPanel } from "@/components/chat-panel"
import type { ChatMessage, Plan } from "@/lib/types"
import { suggestedPrompts } from "@/lib/mock-data"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function PlanPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      const isDemoMode = localStorage.getItem("shadow_demo_mode")
      const hasSelectedRepo = localStorage.getItem("selectedRepo")

      if (!isDemoMode && !hasSelectedRepo) {
        router.push("/login")
        return
      }
    }
  }, [isAuthenticated, mounted, router])

  useEffect(() => {
    // Load existing chat history if any
    const savedMessages = localStorage.getItem("chatHistory")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  const saveMessages = (newMessages: ChatMessage[]) => {
    localStorage.setItem("chatHistory", JSON.stringify(newMessages))
    setMessages(newMessages)
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMessage]
    saveMessages(newMessages)
    setIsLoading(true)

    try {
      // Generate tickets using Martian API only
      const martianResponse = await fetch('/api/martian-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content, codeContext: '' }),
      })
      
      if (!martianResponse.ok) {
        throw new Error(`Martian API error: ${martianResponse.status}`)
      }

      // const { aiResponseData } = await martianResponse.json()
      // const aiProcessor = new AIResponseProcessor()
      // const result = await aiProcessor.processAndImport(aiResponseData, "current-project")
      const result = await martianResponse.json()
      
      const plan: Plan = {
        id: `plan-${Date.now()}`,
        summary: result.summary,
        stages: ["Discovery", "Development", "Testing", "Production"],
        tickets: result.tickets,
        createdAt: new Date().toISOString(),
      }
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: "assistant",
        content: `I've analyzed your request and created ${plan.tickets.length} actionable tickets for "${content}". These are now ready for implementation in your kanban board.`,
        plan,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      saveMessages(finalMessages)
      
      // Store the plan for the processes page
      localStorage.setItem("currentPlan", JSON.stringify(plan))
      
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <RepoHeader />
      <div className="flex-1 shadow-panel m-6 rounded-xl overflow-hidden">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onSuggestedPrompt={handleSuggestedPrompt}
          suggestedPrompts={suggestedPrompts}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
