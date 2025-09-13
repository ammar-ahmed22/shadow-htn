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

  const generatePlanWithGroq = async (userPrompt: string): Promise<Plan> => {
    try {
      // Get repository info if available
      const selectedRepo = localStorage.getItem("selectedRepo")
      let repositoryInfo = null
      if (selectedRepo) {
        repositoryInfo = JSON.parse(selectedRepo)
      }

      const response = await fetch('/api/generate-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          repositoryInfo
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

      const plan = await response.json()
      return plan
    } catch (error) {
      console.error('Error generating plan with Groq:', error)
      
      // Fallback to mock plan if API fails
      return {
        id: `plan-${Date.now()}`,
        summary: `Shadow will help you ${userPrompt.toLowerCase()} through a structured approach.`,
        stages: ["Discovery", "Development", "Testing", "Production"],
        tickets: [
          {
            id: `T-${Date.now()}`,
            title: "Initial analysis and setup",
            stage: "Discovery",
            status: "todo" as const,
            assignee: "Shadow",
            repo: "current-repo",
            updatedAt: "just now",
            estimate: "0.5d",
            description: "Analyze requirements and set up project structure",
          },
          {
            id: `T-${Date.now() + 1}`,
            title: "Core implementation",
            stage: "Development", 
            status: "todo" as const,
            assignee: "Shadow",
            repo: "current-repo",
            updatedAt: "just now",
            estimate: "2d",
            description: "Implement main functionality",
            deps: [`T-${Date.now()}`],
          },
          {
            id: `T-${Date.now() + 2}`,
            title: "Testing and validation",
            stage: "Testing",
            status: "todo" as const,
            assignee: "Shadow", 
            repo: "current-repo",
            updatedAt: "just now",
            estimate: "1d",
            description: "Test and validate implementation",
            deps: [`T-${Date.now() + 1}`],
          },
        ],
        createdAt: new Date().toISOString(),
      }
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

    try {
      // Generate plan using Groq API
      const plan = await generatePlanWithGroq(content)
      
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
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
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
