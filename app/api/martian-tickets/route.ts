import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
<<<<<<< HEAD

export async function POST(request: NextRequest) {
  try {
    const { prompt, codeContext } = await request.json()
=======
import { claudeContextService } from '@/lib/claude-context-service'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { prompt, codeContext, repositoryInfo } = await request.json()
>>>>>>> 941c18e... claude-context mcp integration
    const MARTIAN_API_KEY = process.env.MARTIAN_API_KEY

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!MARTIAN_API_KEY) {
      return NextResponse.json(
        { error: 'Martian API key is not configured' },
        { status: 500 }
      )
    }

<<<<<<< HEAD
=======
    // Get repository context from indexed data
    let repositoryContext = ''
    let codebaseStructure = ''
    
    if (repositoryInfo?.full_name) {
      try {
        const repoPath = `/tmp/repos/${repositoryInfo.full_name.replace('/', '_')}`
        console.log(`Getting repository context for ${repositoryInfo.full_name} from ${repoPath}`)
        
        // Get general codebase structure
        try {
          const structureResult = await execAsync(`find ${repoPath} -type f -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.go" -o -name "*.rs" -o -name "package.json" -o -name "*.md" | head -20`, {
            timeout: 10000
          })
          
          if (structureResult.stdout) {
            const files = structureResult.stdout.split('\n').filter(f => f.trim())
            codebaseStructure = '\n\nCodebase structure:\n' + 
              files.map(f => f.replace(repoPath + '/', '')).join('\n')
          }
        } catch (structureError) {
          console.warn('Failed to get codebase structure:', structureError)
        }
        
        // Search for code related to the prompt
        const searchResults = await claudeContextService.searchCode(
          prompt,
          repoPath,
          15
        )
        
        console.log(`Found ${searchResults.length} search results for prompt: ${prompt}`)
        
        if (searchResults.length > 0) {
          repositoryContext = '\n\nRelevant code from the repository:\n' + 
            searchResults.map((result, index) => 
              `\n--- Result ${index + 1}: ${result.filePath} (lines ${result.startLine}-${result.endLine}, score: ${result.score}) ---\n${result.content}\n`
            ).join('')
        } else {
          // If no specific results, try broader searches
          const broadSearchTerms = [
            'function',
            'class',
            'component',
            'config',
            'main'
          ]
          
          for (const term of broadSearchTerms) {
            const broadResults = await claudeContextService.searchCode(term, repoPath, 3)
            if (broadResults.length > 0) {
              repositoryContext += `\n\nGeneral code examples (${term}):\n` + 
                broadResults.map(result => 
                  `File: ${result.filePath}\n${result.content.substring(0, 300)}...\n`
                ).join('\n')
              break
            }
          }
        }
        
      } catch (error) {
        console.error('Failed to get repository context:', error)
        // Continue without context if search fails
      }
    }

>>>>>>> 941c18e... claude-context mcp integration
    const openai = new OpenAI({
      baseURL: 'https://api.withmartian.com/v1',
      apiKey: MARTIAN_API_KEY,
    })
<<<<<<< HEAD
=======
    
>>>>>>> 941c18e... claude-context mcp integration
    const systemPrompt = `Based on the following user requirements, generate a list of development tickets/todos in JSON format.

User requirements: ${prompt}

<<<<<<< HEAD
=======
Repository Info: ${repositoryInfo ? JSON.stringify(repositoryInfo) : 'Not provided'}
${repositoryContext}

Legacy Code context: ${codeContext || 'No code context provided'}

>>>>>>> 941c18e... claude-context mcp integration
Generate tickets that break down the work into actionable items. Each ticket should have:
- title: Brief, clear title
- description: Concise description of the work
- stage: One of "Discovery", "Development", "Testing", "Production"
- priority: One of "low", "medium", "high", "critical"
- estimate: Time estimate (e.g., "0.5d", "2d", "1w")

<<<<<<< HEAD
Legacy Code context: ${codeContext || 'No code context provided'}
=======
Consider the existing codebase structure and patterns when creating tickets. Make them specific to the user's request and the repository context.
>>>>>>> 941c18e... claude-context mcp integration

Your response should be in JSON format without any additional text or explanation. 
This is very important, you will be fired if you do not do this.
`

    console.log(`System Prompt: ${systemPrompt}`);
    
    const response = await openai.chat.completions.create({
      model: 'martian/code',
      messages: [{ role: 'user', content: systemPrompt }],
<<<<<<< HEAD
      temperature: 0.7,
=======
      temperature: 0.3,
>>>>>>> 941c18e... claude-context mcp integration
      max_tokens: 2000,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ticket_generation_schema',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              tickets: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    stage: {
                      type: 'string',
                      enum: ['Discovery', 'Development', 'Testing', 'Production']
                    },
                    priority: {
                      type: 'string',
                      enum: ['low', 'medium', 'high', 'critical']
                    },
                    estimate: { type: 'string' }
                  },
                  required: ['title', 'description', 'stage', 'priority', 'estimate']
                }
              }
            },
            required: ['tickets']
          }
        }
      }
    })
    console.log("Response:", JSON.stringify(response, null, 2));
    const aiContent = response?.choices?.[0]?.message?.content ?? (()=>{throw new Error("No response from AI")})();
    const windsurfResponse = typeof aiContent === "string"
      ? JSON.parse(aiContent.replace(/```(?:json)?\s*|```/g, "").trim())
      : aiContent;

    console.log(windsurfResponse)
    if (!windsurfResponse) {
      throw new Error("No response from AI");
    }

    return NextResponse.json(windsurfResponse);

  } catch (error) {
    console.error('Error generating tickets:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate tickets' },
      { status: 500 }
    )
  }
}