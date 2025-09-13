"use client"

import { useState, useEffect } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import type { Ticket } from "@/lib/types"
import { mockTickets } from "@/lib/mock-tickets"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function ProcessesPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      const isDemoMode = localStorage.getItem("shadow_demo_mode")
      if (!isDemoMode) {
        router.push("/login")
        return
      }
    }
  }, [isAuthenticated, mounted, router])

  useEffect(() => {
    // Load tickets from localStorage or convert from current plan
    const storedTickets = localStorage.getItem("processTickets")
    const currentPlan = localStorage.getItem("currentPlan")
    const selectedRepo = localStorage.getItem("selectedRepo")

    if (storedTickets) {
      setTickets(JSON.parse(storedTickets))
    } else if (currentPlan) {
      // Convert plan tickets to process tickets
      const plan = JSON.parse(currentPlan)
      let repoName = "unknown/repo"
      
      if (selectedRepo) {
        const repo = JSON.parse(selectedRepo)
        repoName = repo.full_name || repo.fullName || repoName
      }

      const processTickets: Ticket[] = plan.tickets.map((planTicket: any, index: number) => ({
        id: planTicket.id,
        title: planTicket.title,
        stage: planTicket.stage || plan.stages[Math.min(index, plan.stages.length - 1)],
        status: "todo" as const, // All tickets start as todo
        assignee: "Shadow",
        repo: repoName,
        updatedAt: "just now",
        description: planTicket.description || `Generated from plan: ${planTicket.title}`,
        deps: planTicket.dependencies || planTicket.deps || [],
        progress: {
          testsPassed: 0,
          testsTotal: 0,
          typeErrors: 0,
        }
      }))
      
      setTickets(processTickets)
      localStorage.setItem("processTickets", JSON.stringify(processTickets))
    } else {
      // No plan available, show empty state
      setTickets([])
    }
  }, [])

  const handleTicketUpdate = (ticketId: string, updates: Partial<Ticket>) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, ...updates, updatedAt: "just now" } : ticket,
    )
    setTickets(updatedTickets)
    localStorage.setItem("processTickets", JSON.stringify(updatedTickets))
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Processes</h1>
        <p className="text-muted-foreground">Track and manage your development tickets</p>
        {tickets.length === 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              No tickets available. Create a plan in the <a href="/plan" className="text-primary hover:underline">Plan</a> section to generate tickets.
            </p>
          </div>
        )}
      </div>

      <KanbanBoard tickets={tickets} onTicketUpdate={handleTicketUpdate} />
    </div>
  )
}
