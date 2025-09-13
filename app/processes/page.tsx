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
    // Load tickets from localStorage or use mock data
    const storedTickets = localStorage.getItem("processTickets")
    const currentPlan = localStorage.getItem("currentPlan")

    if (storedTickets) {
      setTickets(JSON.parse(storedTickets))
    } else if (currentPlan) {
      // Convert plan tickets to process tickets
      const plan = JSON.parse(currentPlan)
      const processTickets: Ticket[] = plan.tickets.map((planTicket: any, index: number) => ({
        id: planTicket.id,
        title: planTicket.title,
        stage: plan.stages[Math.min(index, plan.stages.length - 1)],
        status: index === 0 ? "in_progress" : "todo",
        assignee: "Shadow",
        repo: "acme/web-app",
        updatedAt: "just now",
        description: `Generated from plan: ${planTicket.title}`,
        deps: planTicket.deps,
      }))
      setTickets([...mockTickets, ...processTickets])
      localStorage.setItem("processTickets", JSON.stringify([...mockTickets, ...processTickets]))
    } else {
      setTickets(mockTickets)
      localStorage.setItem("processTickets", JSON.stringify(mockTickets))
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
      </div>

      <KanbanBoard tickets={tickets} onTicketUpdate={handleTicketUpdate} />
    </div>
  )
}
