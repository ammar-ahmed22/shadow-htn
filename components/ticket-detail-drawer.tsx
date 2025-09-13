"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  X,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  AlertCircle,
  Clock,
  GitPullRequest,
  FileText,
} from "lucide-react"
import type { Ticket } from "@/lib/types"

interface TicketDetailDrawerProps {
  ticket: Ticket
  onClose: () => void
  onUpdate: (updates: Partial<Ticket>) => void
}

export function TicketDetailDrawer({ ticket, onClose, onUpdate }: TicketDetailDrawerProps) {
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "plan_created":
        return <FileText className="w-4 h-4" />
      case "run_started":
        return <Play className="w-4 h-4" />
      case "pr_opened":
        return <GitPullRequest className="w-4 h-4" />
      case "checks_passed":
        return <CheckCircle2 className="w-4 h-4" />
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "changes_requested":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const handleApprove = () => {
    onUpdate({ status: "done" })
  }

  const handleRequestChanges = () => {
    // In a real app, this would open a comment dialog
    console.log("Request changes for", ticket.id)
  }

  const handleRerun = () => {
    console.log("Re-run", ticket.id)
  }

  const handleRollback = () => {
    console.log("Rollback", ticket.id)
  }

  const hasErrors = ticket.progress?.typeErrors && ticket.progress.typeErrors > 0

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(ticket.status)}`} />
                <Badge variant="outline" className="font-mono">
                  {ticket.id}
                </Badge>
              </div>
              <SheetTitle className="text-left">{ticket.title}</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shadow-focus">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Stage:</span>
              <Badge variant="secondary">{ticket.stage}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline" className="capitalize">
                {ticket.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Dependencies */}
          {ticket.deps && ticket.deps.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Dependencies</h4>
              <div className="flex flex-wrap gap-2">
                {ticket.deps.map((dep) => (
                  <Badge key={dep} variant="outline" className="font-mono">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {ticket.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{ticket.description}</p>
            </div>
          )}

          {/* Progress */}
          {ticket.progress && (
            <div>
              <h4 className="font-medium mb-3">Progress</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tests</span>
                  <span>
                    {ticket.progress.testsPassed}/{ticket.progress.testsTotal}
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
                {hasErrors && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{ticket.progress.typeErrors} type errors remaining</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Links */}
          <div>
            <h4 className="font-medium mb-3">Links</h4>
            <div className="space-y-2">
              {ticket.prUrl && (
                <a
                  href={ticket.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground shadow-transition"
                >
                  <GitPullRequest className="w-4 h-4" />
                  <span>Pull Request</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {ticket.branch && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GitBranch className="w-4 h-4" />
                  <span>{ticket.branch}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Run logs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Artifacts</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Timeline */}
          {ticket.activity && ticket.activity.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Activity</h4>
              <div className="space-y-3">
                {ticket.activity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="font-medium">Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleApprove} className="shadow-focus">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button variant="outline" onClick={handleRequestChanges} className="shadow-focus bg-transparent">
                <XCircle className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleRerun} className="shadow-focus bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Re-run
              </Button>
              <Button variant="outline" onClick={handleRollback} disabled className="shadow-focus bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Rollback
              </Button>
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>{ticket.assignee === "Shadow" ? "S" : ticket.assignee[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{ticket.assignee}</div>
              <div className="text-xs text-muted-foreground">Assignee</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
