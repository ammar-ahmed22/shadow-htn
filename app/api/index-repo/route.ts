import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { claudeContextService } from '@/lib/claude-context-service'
import { Repository } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repo, repoPath } = await request.json()
    
    if (!repo || !repoPath) {
      return NextResponse.json(
        { error: 'Repository and repoPath are required' }, 
        { status: 400 }
      )
    }

    // Start indexing the repository
    const result = await claudeContextService.indexRepository(repo as Repository, repoPath)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error indexing repository:', error)
    return NextResponse.json(
      { error: 'Failed to index repository' }, 
      { status: 500 }
    )
  }
}
