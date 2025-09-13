"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, GitBranch, AlertCircle } from "lucide-react"
import type { Ticket } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TicketCardProps {
  ticket: Ticket
  onClick: () => void
  onDragStart: () => void
  isDragging?: boolean
}

export function TicketCard({ ticket, onClick, onDragStart, isDragging }: TicketCardProps) {
  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "todo":
        return "bg-gray-500"
      case "in_progress":
        return "bg-blue-500"
      case "review":
        return "bg-yellow-500"
      case "done":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getProgressPercentage = () => {
    if (!ticket.progress) return 0
    const { testsPassed = 0, testsTotal = 0 } = ticket.progress
    return testsTotal > 0 ? (testsPassed / testsTotal) * 100 : 0
  }

  const hasErrors = ticket.progress?.typeErrors && ticket.progress.typeErrors > 0

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        "p-4 border border-border rounded-lg bg-card hover:bg-muted/50 cursor-pointer shadow-transition",
        "shadow-focus",
        isDragging && "opacity-50 scale-95",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
          <Badge variant="outline" className="text-xs font-mono">
            {ticket.id}
          </Badge>
        </div>
        {ticket.prUrl && <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground" />}
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm mb-3 line-clamp-2">{ticket.title}</h4>

      {/* Progress */}
      {ticket.progress && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tests</span>
            <span>
              {ticket.progress.testsPassed}/{ticket.progress.testsTotal}
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-1" />
          {hasErrors && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span>{ticket.progress.typeErrors} type errors</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src="/placeholder.svg?height=20&width=20" />
            <AvatarFallback className="text-xs">
              {ticket.assignee === "Shadow" ? "S" : ticket.assignee[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="w-3 h-3" />
            <span className="truncate max-w-20">{ticket.repo}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{ticket.updatedAt}</span>
      </div>
    </div>
  )
}
