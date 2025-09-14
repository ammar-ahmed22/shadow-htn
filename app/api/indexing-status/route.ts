import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { claudeContextService } from '@/lib/claude-context-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const repoPath = searchParams.get('repoPath')
    
    if (!repoPath) {
      return NextResponse.json(
        { error: 'repoPath parameter is required' }, 
        { status: 400 }
      )
    }

    // Get indexing status
    const status = await claudeContextService.getIndexingStatus(repoPath)
    
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting indexing status:', error)
    return NextResponse.json(
      { error: 'Failed to get indexing status' }, 
      { status: 500 }
    )
  }
}
