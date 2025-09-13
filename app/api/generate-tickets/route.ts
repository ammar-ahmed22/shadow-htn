import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

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

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
    }

    // Create system prompt for ticket generation
    const systemPrompt = `You are Shadow, an AI development assistant that helps with code migration and development tasks. You should respond conversationally and create detailed, context-aware project tickets.

Repository Info: ${repositoryInfo ? JSON.stringify(repositoryInfo) : 'Not provided'}

First, analyze the user's request to determine:
1. Complexity level (simple, moderate, complex)
2. Project scope (small feature, medium project, large refactor)
3. Required expertise level
4. Estimated timeline

Then respond with a JSON object containing:
- response: A conversational response acknowledging the request and explaining your approach (e.g., "I'll help you create a Python calculator app! This is a great beginner project that we can build step by step...")
- complexity: "simple", "moderate", or "complex" 
- estimatedDuration: Overall project timeline (e.g., "2-3 days", "1-2 weeks")
- summary: Brief technical overview of the plan
- stages: Array of relevant stage names for this project
- tickets: Array of detailed, context-specific ticket objects

For tickets, adapt detail level based on complexity:
- Simple projects: 3-5 high-level tickets with basic descriptions
- Moderate projects: 5-8 tickets with moderate detail and some sub-tasks
- Complex projects: 8-15+ detailed tickets with comprehensive descriptions, dependencies, and technical specifications

Each ticket should include:
- id: Unique ID (format: T-XXXX where XXXX is random 4-digit number)
- title: Clear, specific title related to the actual request
- description: Detailed description that directly addresses the user's needs
- estimate: Realistic time estimate based on complexity
- stage: Appropriate stage for this type of work
- dependencies: Array of ticket IDs this depends on
- priority: Based on logical development order
- tags: Array of relevant technology/feature tags

Make tickets highly relevant to the specific request. For a calculator app, include tickets about UI design, calculation logic, error handling, etc. For a codebase refactor, include analysis, migration planning, testing, etc.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
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
        temperature: 0.3,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from Groq API')
    }

    // Try to parse the JSON response
    let planData
    try {
      // Extract JSON from the response if it's wrapped in markdown or other text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
      planData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse Groq response:', parseError)
      console.log('Raw AI response:', aiResponse)
      
      // Create a more intelligent fallback based on the prompt
      const isSimpleTask = prompt.toLowerCase().includes('calculator') || 
                          prompt.toLowerCase().includes('simple') ||
                          prompt.toLowerCase().includes('basic')
      
      planData = {
        response: `I'll help you with "${prompt}". Let me break this down into manageable tasks.`,
        complexity: isSimpleTask ? "simple" : "moderate",
        estimatedDuration: isSimpleTask ? "1-2 days" : "3-5 days",
        summary: `Implementation plan for: ${prompt}`,
        stages: ["Planning", "Development", "Testing", "Deployment"],
        tickets: [
          {
            id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
            title: "Project setup and requirements analysis",
            description: `Analyze requirements and set up project structure for: ${prompt}`,
            estimate: "0.5d",
            stage: "Planning",
            dependencies: [],
            priority: "high",
            tags: ["setup", "analysis"]
          },
          {
            id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
            title: "Core functionality implementation",
            description: `Implement the main features and logic for: ${prompt}`,
            estimate: isSimpleTask ? "1d" : "2d",
            stage: "Development",
            dependencies: [],
            priority: "high",
            tags: ["development", "core"]
          },
          {
            id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
            title: "Testing and validation",
            description: "Write tests and validate functionality works as expected",
            estimate: "0.5d",
            stage: "Testing",
            dependencies: [],
            priority: "medium",
            tags: ["testing", "validation"]
          }
        ]
      }
    }

    // Ensure the plan has required fields
    const plan = {
      id: `plan-${Date.now()}`,
      response: planData.response || `I'll help you with "${prompt}". Let me create a plan for this.`,
      complexity: planData.complexity || "moderate",
      estimatedDuration: planData.estimatedDuration || "3-5 days",
      summary: planData.summary || `Implementation plan for: ${prompt}`,
      stages: planData.stages || ["Planning", "Development", "Testing", "Deployment"],
      tickets: planData.tickets || [],
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
