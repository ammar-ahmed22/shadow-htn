import { getInstallationForUser, getInstallationOctokit, getRepoFiles } from '@/lib/github'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, owner, repo } = await request.json()
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

    const installation = await getInstallationForUser(owner);
    const octokit = await getInstallationOctokit(installation[0].id as number)
    const files = await getRepoFiles(octokit, owner, repo);
    const codeContext = files.map(f => `### File: ${f.path}\n${f.content}\n`).join('\n');

    const openai = new OpenAI({
      baseURL: 'https://api.withmartian.com/v1',
      apiKey: MARTIAN_API_KEY,
    })

    const systemPrompt = `Based on the following user requirements, complete repo file contents with paths, generate a list of development tickets/todos of small units of work in JSON format.

User requirements: ${prompt}


Generate tickets that break down the work into actionable items. Each ticket should have:
- title: Brief, clear title
- description: Concise description of the work
- stage: One of "Discovery", "Development", "Testing", "Production"
- priority: One of "low", "medium", "high", "critical"
- estimate: Time estimate (e.g., "0.5d", "2d", "1w")

Consider the existing codebase structure and patterns when creating tickets. Make them specific to the user's request and the repository context.

Your response should be in JSON format of the form, { tickets: []{ title: string, description: string, stage: string, priority: string, estimate: string }} without any additional text or explanation. 
This is very important, you will be fired if you do not do this.

## Existing Codebase
${codeContext || 'No additional code context provided.'}
`

    const response = await openai.chat.completions.create({
      model: 'martian/code',
      messages: [{ role: 'user', content: systemPrompt }],
      temperature: 0.3,
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
    const martianResponse = response?.choices?.[0]?.message?.content ?? (() => { throw new Error("No response from AI") })();
    let parsedResponse = typeof martianResponse === "string"
      ? JSON.parse(martianResponse.replace(/```(?:json)?\s*|```/g, "").trim())
      : martianResponse;

    if (Array.isArray(parsedResponse)) {
      parsedResponse = { tickets: parsedResponse };
    }

    console.log(parsedResponse)
    if (!parsedResponse) {
      throw new Error("No response from AI");
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error generating tickets:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate tickets' },
      { status: 500 }
    )
  }
}
