import type { Ticket, ActivityItem } from "./types"

const mockActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "plan_created",
    message: "Plan created from user request",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "act-2",
    type: "run_started",
    message: "Shadow started working on this ticket",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "act-3",
    type: "pr_opened",
    message: "Pull request opened",
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
]

export const mockTickets: Ticket[] = [
  {
    id: "T-1023",
    title: "Add tsconfig, types, and CI check",
    stage: "Setup",
    status: "done",
    assignee: "Shadow",
    repo: "acme/web-app",
    branch: "shadow/setup-typescript",
    prUrl: "https://github.com/acme/web-app/pull/41",
    progress: {
      testsPassed: 150,
      testsTotal: 150,
      typeErrors: 0,
    },
    updatedAt: "1h ago",
    description:
      "Set up TypeScript configuration, install type definitions, and configure CI pipeline to check for type errors.",
    activity: mockActivity,
  },
  {
    id: "T-1024",
    title: "Convert src/lib to TypeScript",
    stage: "Transform",
    status: "in_progress",
    assignee: "Shadow",
    repo: "acme/web-app",
    branch: "shadow/js-to-ts",
    prUrl: "https://github.com/acme/web-app/pull/42",
    progress: {
      testsPassed: 142,
      testsTotal: 150,
      typeErrors: 5,
    },
    deps: ["T-1023"],
    updatedAt: "2m ago",
    description:
      "Convert all JavaScript files in the src/lib directory to TypeScript, adding proper type annotations and interfaces.",
    activity: mockActivity.slice(0, 2),
  },
  {
    id: "T-1025",
    title: "Fix remaining type errors",
    stage: "Validate",
    status: "todo",
    assignee: "Shadow",
    repo: "acme/web-app",
    deps: ["T-1024"],
    updatedAt: "5m ago",
    description: "Address all remaining TypeScript compilation errors and ensure strict type checking passes.",
  },
  {
    id: "T-1026",
    title: "Open PR and run checks",
    stage: "Review",
    status: "todo",
    assignee: "Shadow",
    repo: "acme/web-app",
    deps: ["T-1025"],
    updatedAt: "5m ago",
    description: "Create final pull request with all changes and ensure all CI checks pass before requesting review.",
  },
  {
    id: "T-2001",
    title: "Implement user authentication",
    stage: "Development",
    status: "review",
    assignee: "Shadow",
    repo: "acme/web-app",
    branch: "shadow/auth-system",
    prUrl: "https://github.com/acme/web-app/pull/43",
    progress: {
      testsPassed: 89,
      testsTotal: 95,
      typeErrors: 0,
    },
    updatedAt: "30m ago",
    description: "Implement complete user authentication system with login, registration, and session management.",
    activity: mockActivity,
  },
]
