import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { claudeContextService } from '@/lib/claude-context-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, repoPath, limit = 5 } = await request.json()
    
    if (!query || !repoPath) {
      return NextResponse.json(
        { error: 'Query and repoPath are required' }, 
        { status: 400 }
      )
    }

    // Search the indexed repository
    const results = await claudeContextService.searchCode(query, repoPath, limit)
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching code:', error)
    return NextResponse.json(
      { error: 'Failed to search code' }, 
      { status: 500 }
    )
  }
}
