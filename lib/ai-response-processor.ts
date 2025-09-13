/**
 * AI Response Processor
 * 
 * Handles processing AI responses and converting them into importable ticket data.
 * This is where you put the AI response data to transform it into tickets.
 */

import { ExternalTicketInput, ExternalTicketBatch, transformExternalTicket, validateExternalTicket } from './external-ticket-schema'
import { TicketManager } from './ticket-manager'
import { Ticket } from './types'

// Structure for raw AI response data
export interface AIResponseData {
  prompt: string // Original user prompt
  response: string // AI's text response
  analysis?: {
    complexity: 'simple' | 'moderate' | 'complex'
    estimatedDuration: string
    technologies: string[]
    dependencies: string[]
  }
  tickets?: any[] // Raw ticket data from AI
  metadata?: {
    model: string
    timestamp: string
    tokens?: number
    [key: string]: any
  }
}

// Processed AI response ready for import
export interface ProcessedAIResponse {
  summary: string
  ticketBatch: ExternalTicketBatch
  analysis: {
    complexity: 'simple' | 'moderate' | 'complex'
    estimatedDuration: string
    technologies: string[]
    totalTickets: number
  }
}

/**
 * Main processor class for AI responses
 */
export class AIResponseProcessor {
  private ticketManager: TicketManager

  constructor() {
    this.ticketManager = new TicketManager()
  }

  /**
   * Process raw AI response data into structured ticket format
   */
  processAIResponse(aiData: AIResponseData, repository: string): ProcessedAIResponse {
    const tickets = this.extractTicketsFromAI(aiData)
    const validatedTickets = tickets.filter(validateExternalTicket)
    
    const ticketBatch: ExternalTicketBatch = {
      source: 'ai-generated',
      repository,
      tickets: validatedTickets,
      metadata: {
        importedAt: new Date().toISOString(),
        importedBy: 'Shadow AI',
        batchId: `ai-batch-${Date.now()}`,
        originalPrompt: aiData.prompt,
        aiModel: aiData.metadata?.model || 'unknown',
        ...aiData.metadata
      }
    }

    return {
      summary: this.generateSummary(aiData, validatedTickets.length),
      ticketBatch,
      analysis: {
        complexity: aiData.analysis?.complexity || 'moderate',
        estimatedDuration: aiData.analysis?.estimatedDuration || 'unknown',
        technologies: aiData.analysis?.technologies || [],
        totalTickets: validatedTickets.length
      }
    }
  }

  /**
   * Extract tickets from various AI response formats
   */
  private extractTicketsFromAI(aiData: AIResponseData): ExternalTicketInput[] {
    const tickets: ExternalTicketInput[] = []

    // If AI provided structured tickets
    if (aiData.tickets && Array.isArray(aiData.tickets)) {
      tickets.push(...aiData.tickets.map(this.normalizeAITicket))
    }

    // If no structured tickets, try to parse from response text
    if (tickets.length === 0 && aiData.response) {
      tickets.push(...this.parseTicketsFromText(aiData.response))
    }

    // Fallback: create a single ticket from the prompt
    if (tickets.length === 0) {
      tickets.push({
        title: aiData.prompt,
        description: aiData.response || 'AI-generated task',
        stage: 'Discovery',
        priority: 'medium'
      })
    }

    return tickets
  }

  /**
   * Normalize AI ticket data to our format
   */
  private normalizeAITicket(aiTicket: any): ExternalTicketInput {
    return {
      title: aiTicket.title || aiTicket.name || 'Untitled Task',
      description: aiTicket.description || aiTicket.details || aiTicket.title,
      stage: this.mapStage(aiTicket.stage || aiTicket.status),
      priority: this.mapPriority(aiTicket.priority),
      estimate: aiTicket.estimate || aiTicket.duration || aiTicket.timeEstimate,
      assignee: aiTicket.assignee || 'Shadow',
      tags: aiTicket.tags || aiTicket.labels || [],
      dependencies: aiTicket.dependencies || aiTicket.deps || []
    }
  }

  /**
   * Parse tickets from AI response text using patterns
   */
  private parseTicketsFromText(responseText: string): ExternalTicketInput[] {
    const tickets: ExternalTicketInput[] = []
    
    // Look for numbered lists or bullet points
    const ticketPatterns = [
      /^\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gm, // 1. Task name
      /^[-*]\s*(.+?)(?=\n[-*]|\n\n|$)/gm,   // - Task name or * Task name
      /^#{1,3}\s*(.+?)(?=\n#|\n\n|$)/gm     // # Task name
    ]

    for (const pattern of ticketPatterns) {
      const matches = [...responseText.matchAll(pattern)]
      if (matches.length > 0) {
        matches.forEach((match, index) => {
          const title = match[1].trim()
          if (title.length > 5) { // Filter out very short matches
            tickets.push({
              title,
              description: `Generated from AI response: ${title}`,
              stage: index === 0 ? 'Discovery' : 'Development',
              priority: 'medium'
            })
          }
        })
        break // Use first pattern that finds matches
      }
    }

    return tickets
  }

  /**
   * Map various stage formats to our standard stages
   */
  private mapStage(stage: string): 'Discovery' | 'Development' | 'Testing' | 'Production' {
    if (!stage) return 'Discovery'
    
    const stageMap: Record<string, 'Discovery' | 'Development' | 'Testing' | 'Production'> = {
      'discovery': 'Discovery',
      'research': 'Discovery',
      'planning': 'Discovery',
      'development': 'Development',
      'implementation': 'Development',
      'coding': 'Development',
      'build': 'Development',
      'testing': 'Testing',
      'qa': 'Testing',
      'validation': 'Testing',
      'production': 'Production',
      'deployment': 'Production',
      'release': 'Production',
      'deploy': 'Production'
    }

    return stageMap[stage.toLowerCase()] || 'Discovery'
  }

  /**
   * Map various priority formats to our standard priorities
   */
  private mapPriority(priority: string): 'high' | 'medium' | 'low' {
    if (!priority) return 'medium'
    
    const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
      'high': 'high',
      'urgent': 'high',
      'critical': 'high',
      'important': 'high',
      'medium': 'medium',
      'normal': 'medium',
      'moderate': 'medium',
      'low': 'low',
      'minor': 'low',
      'nice-to-have': 'low'
    }

    return priorityMap[priority.toLowerCase()] || 'medium'
  }

  /**
   * Generate a summary of the processed response
   */
  private generateSummary(aiData: AIResponseData, ticketCount: number): string {
    const complexity = aiData.analysis?.complexity || 'moderate'
    const duration = aiData.analysis?.estimatedDuration || 'unknown duration'
    
    return `Shadow analyzed "${aiData.prompt}" and created ${ticketCount} actionable tickets. ` +
           `This ${complexity} project has an estimated duration of ${duration} and is ready for implementation.`
  }

  /**
   * Import processed AI response directly into ticket system
   */
  async importAIResponse(processedResponse: ProcessedAIResponse): Promise<Ticket[]> {
    const importedTickets: Ticket[] = []
    
    for (const externalTicket of processedResponse.ticketBatch.tickets) {
      const ticket = transformExternalTicket(externalTicket, processedResponse.ticketBatch.repository)
      importedTickets.push(ticket)
    }

    // Save tickets using TicketManager
    importedTickets.forEach(ticket => {
      this.ticketManager.createTicket({
        ...ticket,
        description: ticket.description || ticket.title
      })
    })
    
    return importedTickets
  }

  /**
   * Complete workflow: Process AI data and import tickets
   */
  async processAndImport(aiData: AIResponseData, repository: string): Promise<{
    summary: string
    tickets: Ticket[]
    analysis: ProcessedAIResponse['analysis']
  }> {
    const processed = this.processAIResponse(aiData, repository)
    const tickets = await this.importAIResponse(processed)
    
    return {
      summary: processed.summary,
      tickets,
      analysis: processed.analysis
    }
  }
}

// Convenience function for quick processing
export async function processAIResponseData(
  aiData: AIResponseData, 
  repository: string
): Promise<Ticket[]> {
  const processor = new AIResponseProcessor()
  const result = await processor.processAndImport(aiData, repository)
  return result.tickets
}

// Example usage patterns
export const exampleAIData = {
  // Structured AI response with tickets
  structured: {
    prompt: "Build a user authentication system",
    response: "I'll help you build a comprehensive authentication system...",
    analysis: {
      complexity: 'moderate' as const,
      estimatedDuration: '1 week',
      technologies: ['React', 'Node.js', 'JWT', 'bcrypt'],
      dependencies: ['database setup', 'email service']
    },
    tickets: [
      {
        title: "Set up authentication database schema",
        description: "Create users table with proper indexes",
        stage: "Discovery",
        priority: "high",
        estimate: "0.5d"
      },
      {
        title: "Implement JWT token handling",
        description: "Create token generation and validation",
        stage: "Development", 
        priority: "high",
        estimate: "1d"
      }
    ],
    metadata: {
      model: "gpt-4",
      timestamp: new Date().toISOString(),
      tokens: 1500
    }
  },

  // Text-based AI response (will be parsed)
  textBased: {
    prompt: "Create a blog system",
    response: `Here's your blog system plan:
    
    1. Set up database models for posts and users
    2. Create REST API endpoints for CRUD operations  
    3. Build responsive frontend components
    4. Implement user authentication
    5. Add rich text editor for posts
    6. Deploy to production environment`,
    analysis: {
      complexity: 'complex' as const,
      estimatedDuration: '2 weeks',
      technologies: ['Next.js', 'Prisma', 'PostgreSQL'],
      dependencies: []
    },
    metadata: {
      model: "claude-3",
      timestamp: new Date().toISOString()
    }
  }
} as const
