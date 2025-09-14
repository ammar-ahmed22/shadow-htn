"use client"

import { useState, useEffect } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { Ticket } from "@/lib/types"
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
    // Load tickets from current plan (AI-generated tickets)
    const currentPlan = localStorage.getItem("currentPlan")
    const selectedRepo = localStorage.getItem("selectedRepo")

    if (currentPlan) {
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
        stage: planTicket.stage || ["Discovery", "Development", "Testing", "Production"][Math.min(index, 3)] as Ticket['stage'],
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
      // Clear any old demo data
      localStorage.removeItem("processTickets")
    }
  }, [])

  const handleTicketUpdate = (ticketId: string, updates: Partial<Ticket>) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, ...updates, updatedAt: "just now" } : ticket,
    )
    setTickets(updatedTickets)
    localStorage.setItem("processTickets", JSON.stringify(updatedTickets))
  }

  const refreshTickets = () => {
    // Force refresh from current plan
    const currentPlan = localStorage.getItem("currentPlan")
    const selectedRepo = localStorage.getItem("selectedRepo")

    if (currentPlan) {
      const plan = JSON.parse(currentPlan)
      let repoName = "unknown/repo"
      
      if (selectedRepo) {
        const repo = JSON.parse(selectedRepo)
        repoName = repo.full_name || repo.fullName || repoName
      }

      const processTickets: Ticket[] = plan.tickets.map((planTicket: any, index: number) => ({
        id: planTicket.id,
        title: planTicket.title,
        stage: planTicket.stage || ["Discovery", "Development", "Testing", "Production"][Math.min(index, 3)] as Ticket['stage'],
        status: "todo" as const,
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
      setTickets([])
      localStorage.removeItem("processTickets")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Processes</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshTickets}
            className="shadow-focus"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
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
