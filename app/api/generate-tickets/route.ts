import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
<<<<<<< HEAD
=======
import { claudeContextService } from '@/lib/claude-context-service'
>>>>>>> 941c18e... claude-context mcp integration

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, repositoryInfo } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

<<<<<<< HEAD
=======
    // Get repository context from indexed data
    let repositoryContext = ''
    if (repositoryInfo?.full_name) {
      try {
        const repoPath = `/tmp/repos/${repositoryInfo.full_name.replace('/', '_')}`
        const searchResults = await claudeContextService.searchCode(
          `code related to: ${prompt}`,
          repoPath,
          10
        )
        
        if (searchResults.length > 0) {
          repositoryContext = '\n\nRelevant code from the repository:\n' + 
            searchResults.map(result => 
              `File: ${result.filePath} (lines ${result.startLine}-${result.endLine})\n${result.content}\n`
            ).join('\n')
        }
      } catch (error) {
        console.warn('Failed to get repository context:', error)
        // Continue without context if search fails
      }
    }

>>>>>>> 941c18e... claude-context mcp integration
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
    }

    // Create system prompt for ticket generation
    const systemPrompt = `You are Shadow, an AI development assistant that helps break down development tasks into actionable tickets.

Repository Info: ${repositoryInfo ? JSON.stringify(repositoryInfo) : 'Not provided'}
<<<<<<< HEAD
=======
${repositoryContext}
>>>>>>> 941c18e... claude-context mcp integration

Analyze the user's development request and create a list of actionable tickets. Consider:
1. Task complexity and scope
2. Logical development sequence
3. Dependencies between tasks
4. Realistic time estimates
<<<<<<< HEAD
=======
5. Existing codebase structure and patterns (if repository context is provided)
>>>>>>> 941c18e... claude-context mcp integration

Return a JSON array of ticket objects. Each ticket should have:
- title: Clear, actionable title
- description: Detailed description of what needs to be done
- estimate: Time estimate (e.g., "2h", "1d", "3d")
- priority: "high", "medium", or "low"
- tags: Array of relevant technology/feature tags
- stage: One of ["todo", "in_progress", "review", "done"] - start all as "todo"

Create 4-8 tickets that comprehensively cover the development task. Make them specific to the user's request.

Example for "migrate from TypeScript to Next.js":
[
  {
    "title": "Audit current TypeScript codebase",
    "description": "Review existing TypeScript files, dependencies, and project structure to understand migration scope",
    "estimate": "4h",
    "priority": "high",
    "tags": ["audit", "typescript", "planning"],
    "stage": "todo"
  },
  {
    "title": "Set up Next.js project structure",
    "description": "Initialize new Next.js project, configure TypeScript support, and set up basic routing",
    "estimate": "1d",
    "priority": "high", 
    "tags": ["nextjs", "setup", "configuration"],
    "stage": "todo"
  }
]`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        stream: false
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Groq API error: ${response.status}`, errorBody)
      throw new Error(`Groq API error: ${response.status} - ${errorBody}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from Groq API')
    }

    // Try to parse the JSON response as ticket array
    let tickets
    try {
      // Extract JSON from the response if it's wrapped in markdown or other text
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
      tickets = JSON.parse(jsonString)
      
      // Transform tickets to match our Ticket interface
      tickets = tickets.map((ticket: any, index: number) => ({
        id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
        title: ticket.title,
        description: ticket.description,
        stage: "Discovery", // We'll distribute these across stages
        status: "todo" as const,
        assignee: "Shadow",
        repo: repositoryInfo?.full_name || repositoryInfo?.name || "current-repo",
        updatedAt: "just now",
        estimate: ticket.estimate,
        priority: ticket.priority,
        tags: ticket.tags || [],
        deps: [],
        progress: {
          testsPassed: 0,
          testsTotal: 0,
          typeErrors: 0,
        }
      }))
      
      // Distribute tickets across stages
      const stages = ["Discovery", "Implementation", "Testing", "Review"]
      tickets = tickets.map((ticket: any, index: number) => ({
        ...ticket,
        stage: stages[index % stages.length]
      }))
      
    } catch (parseError) {
      console.error('Failed to parse Groq response:', parseError)
      console.log('Raw AI response:', aiResponse)
      
      // Create fallback tickets
      tickets = [
        {
          id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
          title: "Analyze requirements",
          description: `Break down the requirements for: ${prompt}`,
          stage: "Discovery",
          status: "todo" as const,
          assignee: "Shadow",
          repo: repositoryInfo?.full_name || repositoryInfo?.name || "current-repo",
          updatedAt: "just now",
          estimate: "2h",
          priority: "high",
          tags: ["analysis"],
          deps: [],
          progress: { testsPassed: 0, testsTotal: 0, typeErrors: 0 }
        },
        {
          id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
          title: "Implement core functionality",
          description: `Develop the main features for: ${prompt}`,
          stage: "Implementation", 
          status: "todo" as const,
          assignee: "Shadow",
          repo: repositoryInfo?.full_name || repositoryInfo?.name || "current-repo",
          updatedAt: "just now",
          estimate: "1d",
          priority: "high",
          tags: ["development"],
          deps: [],
          progress: { testsPassed: 0, testsTotal: 0, typeErrors: 0 }
        }
      ]
    }

    // Create plan object with tickets
    const plan = {
      id: `plan-${Date.now()}`,
      summary: `Development plan for: ${prompt}`,
      stages: ["Discovery", "Implementation", "Testing", "Review"],
      tickets: tickets,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error generating tickets:', error)
    return NextResponse.json(
      { error: 'Failed to generate tickets' }, 
      { status: 500 }
    )
  }
}
