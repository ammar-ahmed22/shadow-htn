import { Ticket } from './types'

export interface TicketData {
  id: string
  title: string
  description: string
  stage: "Discovery" | "Development" | "Testing" | "Production"
  status: "todo" | "in_progress" | "review" | "done"
  assignee: string
  repo: string
  estimate?: string
  priority?: "high" | "medium" | "low"
  tags?: string[]
  deps?: string[]
  branch?: string
  prUrl?: string
}

export class TicketManager {
  private tickets: Ticket[] = []

  constructor() {
    this.loadTickets()
  }

  /**
   * Load tickets from localStorage
   */
  private loadTickets(): void {
    const stored = localStorage.getItem("processTickets")
    if (stored) {
      this.tickets = JSON.parse(stored)
    }
  }

  /**
   * Save tickets to localStorage
   */
  private saveTickets(): void {
    localStorage.setItem("processTickets", JSON.stringify(this.tickets))
  }

  /**
   * Create a new ticket from external data
   */
  createTicket(data: TicketData): Ticket {
    const ticket: Ticket = {
      id: data.id,
      title: data.title,
      description: data.description,
      stage: data.stage,
      status: data.status,
      assignee: data.assignee,
      repo: data.repo,
      updatedAt: new Date().toISOString(),
      estimate: data.estimate,
      priority: data.priority || "medium",
      tags: data.tags || [],
      deps: data.deps || [],
      branch: data.branch,
      prUrl: data.prUrl,
      progress: {
        testsPassed: 0,
        testsTotal: 0,
        typeErrors: 0,
      },
      activity: []
    }

    this.tickets.push(ticket)
    this.saveTickets()
    return ticket
  }

  /**
   * Update an existing ticket
   */
  updateTicket(id: string, updates: Partial<Ticket>): Ticket | null {
    const index = this.tickets.findIndex(t => t.id === id)
    if (index === -1) return null

    this.tickets[index] = {
      ...this.tickets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveTickets()
    return this.tickets[index]
  }

  /**
   * Delete a ticket
   */
  deleteTicket(id: string): boolean {
    const index = this.tickets.findIndex(t => t.id === id)
    if (index === -1) return false

    this.tickets.splice(index, 1)
    this.saveTickets()
    return true
  }

  /**
   * Get all tickets
   */
  getAllTickets(): Ticket[] {
    return [...this.tickets]
  }

  /**
   * Get tickets by stage
   */
  getTicketsByStage(stage: Ticket['stage']): Ticket[] {
    return this.tickets.filter(t => t.stage === stage)
  }

  /**
   * Get ticket by ID
   */
  getTicketById(id: string): Ticket | null {
    return this.tickets.find(t => t.id === id) || null
  }

  /**
   * Bulk import tickets from external data
   */
  importTickets(ticketsData: TicketData[]): Ticket[] {
    const newTickets = ticketsData.map(data => {
      const ticket: Ticket = {
        id: data.id,
        title: data.title,
        description: data.description,
        stage: data.stage,
        status: data.status,
        assignee: data.assignee,
        repo: data.repo,
        updatedAt: new Date().toISOString(),
        estimate: data.estimate,
        priority: data.priority || "medium",
        tags: data.tags || [],
        deps: data.deps || [],
        branch: data.branch,
        prUrl: data.prUrl,
        progress: {
          testsPassed: 0,
          testsTotal: 0,
          typeErrors: 0,
        },
        activity: []
      }
      return ticket
    })

    this.tickets = newTickets
    this.saveTickets()
    return newTickets
  }

  /**
   * Clear all tickets
   */
  clearAllTickets(): void {
    this.tickets = []
    this.saveTickets()
  }

  /**
   * Move ticket to different stage
   */
  moveTicketToStage(id: string, newStage: Ticket['stage']): Ticket | null {
    return this.updateTicket(id, { stage: newStage })
  }

  /**
   * Update ticket status
   */
  updateTicketStatus(id: string, status: Ticket['status']): Ticket | null {
    return this.updateTicket(id, { status })
  }

  /**
   * Get tickets grouped by stage
   */
  getTicketsGroupedByStage(): Record<Ticket['stage'], Ticket[]> {
    return {
      Discovery: this.getTicketsByStage("Discovery"),
      Development: this.getTicketsByStage("Development"),
      Testing: this.getTicketsByStage("Testing"),
      Production: this.getTicketsByStage("Production")
    }
  }
}

// Singleton instance
export const ticketManager = new TicketManager()
