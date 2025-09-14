"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, ArrowRight, Trash2 } from "lucide-react"
import type { Plan } from "@/lib/types"
import { useRouter } from "next/navigation"

interface PlanCardProps {
  plan: Plan
  onDiscard?: () => void
}

export function PlanCard({ plan, onDiscard }: PlanCardProps) {
  const router = useRouter()

  const handleCreateTickets = () => {
    // Store plan in localStorage for demo
    localStorage.setItem("currentPlan", JSON.stringify(plan))
    router.push("/processes")
  }

  const totalEstimate = plan.tickets.reduce((acc, ticket) => {
    const days = Number.parseFloat((ticket.estimate || "1d").replace("d", ""))
    return acc + days
  }, 0)

  return (
    <Card className="shadow-panel">
      <CardHeader>
        <CardTitle className="text-lg">Development Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div>
          <h4 className="font-medium mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">{plan.summary}</p>
        </div>

        {/* Stage Gates */}
        <div>
          <h4 className="font-medium mb-3">Stage Gates</h4>
          <div className="flex items-center gap-2 flex-wrap">
            {plan.stages.map((stage, index) => (
              <div key={stage} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {stage}
                </Badge>
                {index < plan.stages.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Proposed Tickets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Proposed Tickets</h4>
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {totalEstimate}d total
            </Badge>
          </div>

          <div className="space-y-3">
            {plan.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-mono">
                      {ticket.id}
                    </Badge>
                    <span className="text-sm font-medium">{ticket.title}</span>
                  </div>
                  {ticket.deps && ticket.deps.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Depends on:</span>
                      {ticket.deps.map((dep, index) => (
                        <span key={dep}>
                          <Badge variant="outline" className="text-xs font-mono">
                            {dep}
                          </Badge>
                          {index < ticket.deps!.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {ticket.estimate}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleCreateTickets} className="flex-1 shadow-focus">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Create Tickets
          </Button>
          {onDiscard && (
            <Button variant="outline" onClick={onDiscard} className="shadow-focus bg-transparent">
              <Trash2 className="w-4 h-4 mr-2" />
              Discard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
