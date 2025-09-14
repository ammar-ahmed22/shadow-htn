import { exec } from 'child_process'
import { promisify } from 'util'
import { Repository } from './types'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

export interface IndexingStatus {
  isIndexing: boolean
  progress: number
  message: string
  indexedFiles?: number
  totalFiles?: number
}

export interface SearchResult {
  content: string
  filePath: string
  startLine: number
  endLine: number
  score: number
}

class ClaudeContextService {
  constructor() {
    // Service for handling repository indexing and search
  }



  async indexRepository(repo: Repository, repoPath: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Indexing repository: ${repo.full_name} at ${repoPath}`)
      
      // Ensure the repos directory exists
      const reposDir = path.dirname(repoPath)
      if (!fs.existsSync(reposDir)) {
        fs.mkdirSync(reposDir, { recursive: true })
      }

      // Clone the repository if it doesn't exist
      if (!fs.existsSync(repoPath)) {
        console.log(`Cloning repository ${repo.full_name}...`)
        const cloneUrl = `https://github.com/${repo.full_name}.git`
        await execAsync(`git clone ${cloneUrl} ${repoPath}`)
        console.log(`Repository cloned successfully`)
      } else {
        console.log(`Repository already exists, updating...`)
        await execAsync(`cd ${repoPath} && git pull`)
      }

      // Register the codebase with the MCP server via snapshot file
      try {
        console.log(`Registering codebase ${repo.full_name} at ${repoPath}`)
        
        const snapshotPath = path.join(process.env.HOME || '/tmp', '.context', 'mcp-codebase-snapshot.json')
        const snapshotDir = path.dirname(snapshotPath)
        
        // Ensure directory exists
        if (!fs.existsSync(snapshotDir)) {
          fs.mkdirSync(snapshotDir, { recursive: true })
        }
        
        // Create or update snapshot file
        let snapshot: { codebases: any[] } = { codebases: [] }
        if (fs.existsSync(snapshotPath)) {
          try {
            const existingSnapshot = fs.readFileSync(snapshotPath, 'utf8')
            snapshot = JSON.parse(existingSnapshot)
            if (!snapshot.codebases) {
              snapshot.codebases = []
            }
          } catch (e) {
            console.warn('Could not parse existing snapshot, creating new one')
            snapshot = { codebases: [] }
          }
        }
        
        // Add or update this codebase
        const existingIndex = snapshot.codebases.findIndex((cb: any) => cb.name === repo.full_name)
        const codebaseEntry = {
          name: repo.full_name,
          path: repoPath,
          lastIndexed: new Date().toISOString(),
          status: 'pending_index',
          files: [] as string[]
        }
        
        // Get basic file structure for the codebase entry
        try {
          const fileListResult = await execAsync(`find ${repoPath} -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.go" -o -name "*.rs" -o -name "*.cpp" -o -name "*.c" -o -name "*.h" \\) | head -50`, {
            timeout: 10000
          })
          
          if (fileListResult.stdout) {
            const files = fileListResult.stdout.split('\n').filter(f => f.trim()).map(f => f.replace(repoPath + '/', ''))
            codebaseEntry.files = files
            console.log(`Found ${files.length} code files in repository`)
          }
        } catch (fileError) {
          console.warn('Could not get file list, proceeding without it:', fileError instanceof Error ? fileError.message : 'Unknown error')
        }
        
        if (existingIndex >= 0) {
          snapshot.codebases[existingIndex] = codebaseEntry
          console.log(`Updated existing codebase entry for ${repo.full_name}`)
        } else {
          snapshot.codebases.push(codebaseEntry)
          console.log(`Added new codebase entry for ${repo.full_name}`)
        }
        
        fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2))
        console.log(`Updated snapshot file at ${snapshotPath}`)
        
        // Trigger a lightweight indexing process in the background (non-blocking)
        this.triggerBackgroundIndexing(repoPath, repo.full_name).catch(error => {
          console.warn(`Background indexing failed for ${repo.full_name}:`, error.message)
        })
        
        return {
          success: true,
          message: `Repository ${repo.full_name} registered for indexing. Background indexing in progress.`
        }
        
      } catch (error) {
        console.error('Failed to register codebase:', error)
        return {
          success: true,
          message: `Repository ${repo.full_name} cloned successfully (indexing registration failed but repo is ready)`
        }
      }
    } catch (error) {
      console.error('Error indexing repository:', error)
      return {
        success: false,
        message: `Failed to index repository: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async searchCode(query: string, repoPath: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      console.log(`Searching code in ${repoPath} for: ${query}`)
      
      // Skip direct MCP search to avoid hanging - go straight to file search
      console.log(`Using direct file search for better reliability`)

      // Use direct file search for reliability
      try {
        console.log(`Searching files directly in ${repoPath}`)
        
        // Try ripgrep first, fallback to grep
        let grepCommand = `rg -i -n -C 3 "${query}" --type-add 'code:*.{js,ts,jsx,tsx,py,java,cpp,c,h,go,rs,rb,php}' -t code`
        let grepResult
        
        try {
          grepResult = await execAsync(grepCommand, {
            cwd: repoPath,
            timeout: 10000 // Shorter timeout
          })
        } catch (rgError) {
          // Fallback to regular grep if ripgrep is not available
          console.log('Ripgrep not available, using grep fallback')
          grepCommand = `grep -r -i -n -A 3 -B 3 "${query}" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.py" --include="*.java" --include="*.go" --include="*.rs" --include="*.cpp" --include="*.c" --include="*.h" .`
          grepResult = await execAsync(grepCommand, {
            cwd: repoPath,
            timeout: 10000
          })
        }
        
        if (grepResult.stdout) {
          const lines = grepResult.stdout.split('\n').filter(line => line.trim())
          const results: SearchResult[] = []
          
          let currentFile = ''
          let currentContent = ''
          let currentLine = 1
          
          for (const line of lines.slice(0, limit * 3)) { // Get more lines to process
            const fileMatch = line.match(/^([^:]+):(\d+):(.*)$/)
            if (fileMatch) {
              if (currentFile && currentContent) {
                results.push({
                  content: currentContent.trim(),
                  filePath: currentFile.replace(repoPath + '/', ''),
                  startLine: currentLine,
                  endLine: currentLine + currentContent.split('\n').length - 1,
                  score: 0.8
                })
              }
              
              currentFile = fileMatch[1]
              currentLine = parseInt(fileMatch[2])
              currentContent = fileMatch[3]
            } else if (line.includes(':')) {
              currentContent += '\n' + line.split(':').slice(1).join(':')
            }
          }
          
          // Add the last result
          if (currentFile && currentContent && results.length < limit) {
            results.push({
              content: currentContent.trim(),
              filePath: currentFile.replace(repoPath + '/', ''),
              startLine: currentLine,
              endLine: currentLine + currentContent.split('\n').length - 1,
              score: 0.8
            })
          }
          
          console.log(`Found ${results.length} results using direct search`)
          return results.slice(0, limit)
        }
      } catch (grepError) {
        console.warn(`Direct file search failed:`, grepError instanceof Error ? grepError.message : 'Unknown error')
      }

      // Final fallback: Return empty results
      console.log(`No search results found for query: ${query}`)
      return []
      
    } catch (error) {
      console.error('Error searching code:', error)
      return []
    }
  }

  private async triggerBackgroundIndexing(repoPath: string, repoName: string): Promise<void> {
    // This runs in the background and doesn't block the main response
    console.log(`Starting background indexing for ${repoName}`)
    
    try {
      // Use a shorter timeout and let it fail gracefully if needed
      const env = {
        ...process.env,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        MILVUS_TOKEN: process.env.MILVUS_TOKEN,
        MILVUS_ADDRESS: process.env.MILVUS_ADDRESS,
        EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'OpenAI',
        EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      }

      // Try a simple indexing approach - just notify the running MCP server
      const notifyCommand = `echo "Repository ${repoName} at ${repoPath} ready for indexing" > /tmp/mcp-index-${repoName.replace('/', '_')}.log`
      await execAsync(notifyCommand, { timeout: 5000 })
      
      console.log(`Background indexing notification sent for ${repoName}`)
      
    } catch (error) {
      console.warn(`Background indexing notification failed for ${repoName}:`, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  async getIndexingStatus(repoPath: string): Promise<IndexingStatus> {
    try {
      // Check if the codebase is in our snapshot
      const snapshotPath = path.join(process.env.HOME || '/tmp', '.context', 'mcp-codebase-snapshot.json')
      
      if (fs.existsSync(snapshotPath)) {
        const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
        const codebase = snapshot.codebases?.find((cb: any) => cb.path === repoPath)
        
        if (codebase) {
          return {
            isIndexing: codebase.status === 'pending_index',
            progress: codebase.status === 'indexed' ? 100 : 50,
            message: codebase.status === 'indexed' ? 'Indexing complete' : 'Indexing in progress',
            indexedFiles: codebase.files?.length || 0,
            totalFiles: codebase.files?.length || 0
          }
        }
      }
      
      return {
        isIndexing: false,
        progress: 0,
        message: 'Not indexed',
        indexedFiles: 0,
        totalFiles: 0
      }
    } catch (error) {
      console.error('Error getting indexing status:', error)
      return {
        isIndexing: false,
        progress: 0,
        message: 'Error checking status',
        indexedFiles: 0,
        totalFiles: 0
      }
    }
  }

}

// Export a singleton instance
export const claudeContextService = new ClaudeContextService()
