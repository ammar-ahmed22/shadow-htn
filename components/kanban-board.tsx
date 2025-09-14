import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import type { Ticket, KanbanColumn } from "@/lib/types"
import { TicketCard } from "./ticket-card"
import { TicketDetailDrawer } from "./ticket-detail-drawer"

interface KanbanBoardProps {
  tickets: Ticket[]
  onTicketUpdate: (ticketId: string, updates: Partial<Ticket>) => void
}

export function KanbanBoard({ tickets, onTicketUpdate }: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null)

  const columns: KanbanColumn[] = [
    { id: "todo", title: "To Do", status: "todo", tickets: [] },
    { id: "in_progress", title: "In Progress", status: "in_progress", tickets: [] },
    { id: "review", title: "Review", status: "review", tickets: [] },
    { id: "done", title: "Done", status: "done", tickets: [] },
  ]

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesAssignee = assigneeFilter === "all" || ticket.assignee === assigneeFilter

    return matchesSearch && matchesStatus && matchesAssignee
  })

  // Distribute tickets into columns
  const columnsWithTickets = columns.map((column) => ({
    ...column,
    tickets: filteredTickets.filter((ticket) => ticket.status === column.status),
  }))

  const handleDragStart = (ticketId: string) => {
    setDraggedTicket(ticketId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: Ticket["status"]) => {
    e.preventDefault()
    if (draggedTicket) {
      onTicketUpdate(draggedTicket, { status: newStatus })
      setDraggedTicket(null)
    }
  }

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
  }

  const handleTicketUpdate = (updates: Partial<Ticket>) => {
    if (selectedTicket) {
      onTicketUpdate(selectedTicket.id, updates)
      setSelectedTicket({ ...selectedTicket, ...updates })
    }
  }

  const uniqueAssignees = Array.from(new Set(tickets.map((t) => t.assignee)))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 shadow-focus"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 shadow-focus">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-40 shadow-focus">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {uniqueAssignees.map((assignee) => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="shadow-focus bg-transparent">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columnsWithTickets.map((column) => (
          <div
            key={column.id}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{column.title}</h3>
              <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                {column.tickets.length}
              </div>
            </div>

            {/* Column Content */}
            <div className="space-y-3 min-h-32">
              {column.tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleTicketClick(ticket)}
                  onDragStart={() => handleDragStart(ticket.id)}
                  isDragging={draggedTicket === ticket.id}
                />
              ))}

              {column.tickets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                  No tickets
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <TicketDetailDrawer
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
        />
      )}
    </div>
  )
}
