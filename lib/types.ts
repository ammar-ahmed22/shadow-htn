export interface Plan {
  id: string
  response?: string
  complexity?: "simple" | "moderate" | "complex"
  estimatedDuration?: string
  summary: string
  stages: string[]
  tickets: Ticket[]
  createdAt: string
}

export interface PlanTicket {
  id: string
  title: string
  estimate: string
  deps?: string[]
}

export interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  plan?: Plan
  timestamp: string
}

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  language: string | null
  updated_at: string
  stargazers_count: number
  forks_count: number
  owner: {
    login: string
    avatar_url: string
  }
  // Legacy compatibility fields
  org?: string
  fullName?: string
  avatar?: string
  branch?: string
  lastCommit?: string
  updatedAt?: string
}

export interface Ticket {
  id: string
  title: string
  stage: "Discovery" | "Development" | "Testing" | "Production"
  status: "todo" | "in_progress" | "review" | "done"
  assignee: "Shadow" | string
  repo: string
  branch?: string
  prUrl?: string
  progress?: {
    testsPassed?: number
    testsTotal?: number
    typeErrors?: number
  }
  deps?: string[]
  dependencies?: string[]
  updatedAt: string
  description?: string
  estimate?: string
  priority?: "high" | "medium" | "low"
  tags?: string[]
  activity?: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: "plan_created" | "run_started" | "pr_opened" | "checks_passed" | "approved" | "changes_requested"
  message: string
  timestamp: string
  user?: string
}

export interface KanbanColumn {
  id: string
  title: string
  status: Ticket["status"]
  tickets: Ticket[]
}
