import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, codeContext } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Call the Python Flask API
    const flaskResponse = await fetch('http://127.0.0.1:5000/ticket-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        code_context: codeContext || ''
      }),
    })

    if (!flaskResponse.ok) {
      throw new Error(`Flask API error: ${flaskResponse.status}`)
    }

    const ticketData = await flaskResponse.json()

    // Parse the JSON response if it's a string
    let parsedTickets
    if (typeof ticketData === 'string') {
      parsedTickets = JSON.parse(ticketData)
    } else {
      parsedTickets = ticketData
    }

    // Transform Martian response to our AIResponseData format
    const aiResponseData = {
      prompt: prompt,
      response: `Generated ${parsedTickets.tickets?.length || 0} tickets using Martian AI`,
      analysis: {
        complexity: 'moderate' as const,
        estimatedDuration: calculateEstimatedDuration(parsedTickets.tickets || []),
        technologies: extractTechnologies(prompt, codeContext),
        dependencies: []
      },
      tickets: parsedTickets.tickets || [],
      metadata: {
        model: 'martian/code',
        timestamp: new Date().toISOString(),
        source: 'martian-api'
      }
    }

    return NextResponse.json({
      success: true,
      aiResponseData,
      ticketCount: parsedTickets.tickets?.length || 0
    })

  } catch (error) {
    console.error('Martian API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate tickets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate estimated duration from tickets
function calculateEstimatedDuration(tickets: any[]): string {
  if (!tickets.length) return 'unknown'
  
  let totalDays = 0
  tickets.forEach(ticket => {
    const estimate = ticket.estimate || '1d'
    const match = estimate.match(/(\d+(?:\.\d+)?)(d|w|h)/)
    if (match) {
      const value = parseFloat(match[1])
      const unit = match[2]
      
      switch (unit) {
        case 'h':
          totalDays += value / 8 // 8 hours = 1 day
          break
        case 'd':
          totalDays += value
          break
        case 'w':
          totalDays += value * 5 // 5 working days per week
          break
      }
    }
  })
  
  if (totalDays < 1) return `${Math.ceil(totalDays * 8)}h`
  if (totalDays <= 5) return `${Math.ceil(totalDays)}d`
  return `${Math.ceil(totalDays / 5)}w`
}

// Helper function to extract technologies from prompt and code context
function extractTechnologies(prompt: string, codeContext?: string): string[] {
  const technologies: string[] = []
  const text = `${prompt} ${codeContext || ''}`.toLowerCase()
  
  const techMap = {
    'react': 'React',
    'next': 'Next.js',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'python': 'Python',
    'flask': 'Flask',
    'node': 'Node.js',
    'express': 'Express',
    'mongodb': 'MongoDB',
    'postgres': 'PostgreSQL',
    'mysql': 'MySQL',
    'redis': 'Redis',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'Google Cloud'
  }
  
  Object.entries(techMap).forEach(([key, value]) => {
    if (text.includes(key)) {
      technologies.push(value)
    }
  })
  
  return [...new Set(technologies)] // Remove duplicates
}
