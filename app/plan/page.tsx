"use client"

import { useState, useEffect } from "react"
import { ChatPanel } from "@/components/chat-panel"
import { RepoHeader } from "@/components/repo-header"
import type { ChatMessage, Plan } from "@/lib/types"
import { mockPlan, suggestedPrompts } from "@/lib/mock-data"
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

  const generateMockPlan = (userPrompt: string): Plan => {
    // Generate different plans based on prompt keywords
    if (userPrompt.toLowerCase().includes("typescript") || userPrompt.toLowerCase().includes("ts")) {
      return mockPlan
    }

    // Default plan for other prompts
    return {
      id: `plan-${Date.now()}`,
      summary: `Shadow will help you ${userPrompt.toLowerCase()} through a structured approach.`,
      stages: ["Analyze", "Plan", "Execute", "Validate"],
      tickets: [
        {
          id: "T-2001",
          title: "Initial analysis and setup",
          estimate: "0.5d",
        },
        {
          id: "T-2002",
          title: "Core implementation",
          estimate: "2d",
          deps: ["T-2001"],
        },
        {
          id: "T-2003",
          title: "Testing and validation",
          estimate: "1d",
          deps: ["T-2002"],
        },
      ],
      createdAt: new Date().toISOString(),
    }
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

    // Simulate AI response delay
    setTimeout(() => {
      const plan = generateMockPlan(content)
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: "assistant",
        content: `I'll help you ${content.toLowerCase()}. Let me analyze your project and create a detailed plan.`,
        plan,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      saveMessages(finalMessages)
      setIsLoading(false)
    }, 2000)
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
