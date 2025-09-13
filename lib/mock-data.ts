import type { Plan, ChatMessage } from "./types"

export const mockPlan: Plan = {
  id: "plan-1",
  summary: "Shadow will migrate the repo from JS to TS in four gated stages.",
  stages: ["Discover", "Transform", "Validate", "Review"],
  tickets: [
    {
      id: "T-1023",
      title: "Add tsconfig, types, and CI check",
      estimate: "0.5d",
    },
    {
      id: "T-1024",
      title: "Convert src/lib to TS (batch 1)",
      estimate: "1d",
      deps: ["T-1023"],
    },
    {
      id: "T-1025",
      title: "Fix remaining type errors",
      estimate: "0.5d",
      deps: ["T-1024"],
    },
    {
      id: "T-1026",
      title: "Open PR and run checks",
      estimate: "0.25d",
      deps: ["T-1025"],
    },
  ],
  createdAt: new Date().toISOString(),
}

export const suggestedPrompts = [
  "Convert codebase JS → TS",
  "Migrate WordPress → Next.js + Supabase (preview only)",
  "Upgrade Next 12→14 and fix breaking changes",
]

export const mockChatHistory: ChatMessage[] = [
  {
    id: "msg-1",
    type: "user",
    content: "Convert my JavaScript codebase to TypeScript",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "msg-2",
    type: "assistant",
    content:
      "I'll help you convert your JavaScript codebase to TypeScript. Let me analyze your project structure and create a migration plan.",
    plan: mockPlan,
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
]
