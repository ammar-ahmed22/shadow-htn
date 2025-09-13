/**
 * External Ticket Input Schema
 * 
 * This file defines the data structure for importing tickets from external sources.
 * Use this schema to validate and transform external ticket data before importing
 * into the Shadow app's ticket management system.
 */

import { Ticket } from './types'

// Minimal required fields for external ticket input
export interface ExternalTicketInput {
  title: string
  description?: string
  stage?: 'Discovery' | 'Development' | 'Testing' | 'Production'
  priority?: 'high' | 'medium' | 'low'
  estimate?: string // e.g., "2h", "1d", "3d"
  assignee?: string
  tags?: string[]
  dependencies?: string[] // IDs of other tickets this depends on
  externalId?: string // ID from external system for tracking
  externalUrl?: string // Link to external ticket/issue
}

// Full external ticket data structure (optional fields included)
export interface ExternalTicketData extends ExternalTicketInput {
  id?: string // Will be generated if not provided
  status?: 'todo' | 'in_progress' | 'review' | 'done'
  repo?: string
  branch?: string
  prUrl?: string
  createdAt?: string
  updatedAt?: string
}

// Batch import structure for multiple tickets
export interface ExternalTicketBatch {
  source: string // e.g., "jira", "github", "linear", "manual"
  repository: string // Target repository
  tickets: ExternalTicketInput[]
  metadata?: {
    importedAt: string
    importedBy: string
    batchId: string
    [key: string]: any
  }
}

// Transform external ticket to internal ticket format
export function transformExternalTicket(
  external: ExternalTicketData,
  defaultRepo: string = 'unknown/repo'
): Ticket {
  const now = new Date().toISOString()
  
  return {
    id: external.id || `T-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: external.title,
    description: external.description || external.title,
    stage: external.stage || 'Discovery',
    status: external.status || 'todo',
    assignee: external.assignee || 'Shadow',
    repo: external.repo || defaultRepo,
    updatedAt: external.updatedAt || 'just now',
    estimate: external.estimate,
    deps: external.dependencies || [],
    branch: external.branch,
    prUrl: external.prUrl,
    progress: {
      testsPassed: 0,
      testsTotal: 0,
      typeErrors: 0,
    },
    activity: [],
  }
}

// Validate external ticket input
export function validateExternalTicket(ticket: any): ticket is ExternalTicketInput {
  if (!ticket || typeof ticket !== 'object') {
    return false
  }
  
  if (!ticket.title || typeof ticket.title !== 'string') {
    return false
  }
  
  if (ticket.stage && !['Discovery', 'Development', 'Testing', 'Production'].includes(ticket.stage)) {
    return false
  }
  
  if (ticket.priority && !['high', 'medium', 'low'].includes(ticket.priority)) {
    return false
  }
  
  if (ticket.status && !['todo', 'in_progress', 'review', 'done'].includes(ticket.status)) {
    return false
  }
  
  return true
}

// Example usage for different external sources
export const exampleImports = {
  // GitHub Issues format
  github: {
    source: 'github',
    repository: 'user/repo',
    tickets: [
      {
        title: 'Fix authentication bug',
        description: 'Users cannot log in with OAuth',
        stage: 'Development' as const,
        priority: 'high' as const,
        estimate: '1d',
        tags: ['bug', 'auth', 'oauth'],
        externalId: 'issue-123',
        externalUrl: 'https://github.com/user/repo/issues/123'
      }
    ]
  },
  
  // Jira format
  jira: {
    source: 'jira',
    repository: 'project/app',
    tickets: [
      {
        title: 'Implement user dashboard',
        description: 'Create responsive dashboard with analytics widgets',
        stage: 'Discovery' as const,
        priority: 'medium' as const,
        estimate: '3d',
        assignee: 'john.doe',
        tags: ['feature', 'dashboard', 'analytics'],
        externalId: 'PROJ-456',
        externalUrl: 'https://company.atlassian.net/browse/PROJ-456'
      }
    ]
  },
  
  // Manual/CSV import format
  manual: {
    source: 'manual',
    repository: 'team/project',
    tickets: [
      {
        title: 'Update documentation',
        description: 'Update API documentation for v2.0',
        stage: 'Testing' as const,
        priority: 'low' as const,
        estimate: '0.5d',
        tags: ['docs', 'api']
      }
    ]
  }
} as const
