"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RefreshCw, GitBranch } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Repository } from "@/lib/types"

export function RepoHeader() {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [lastCommit] = useState("abc123f")
  const [isIndexing, setIsIndexing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const repo = localStorage.getItem("selectedRepo")
    if (repo) {
      const parsed = JSON.parse(repo)
      // Convert new Repository format to legacy format for compatibility
      setSelectedRepo({
        ...parsed,
        // Map new format to legacy format
        org: parsed.owner?.login || parsed.org,
        fullName: parsed.full_name || parsed.fullName,
        avatar: parsed.owner?.avatar_url || parsed.avatar,
        branch: "main",
        lastCommit: lastCommit,
      })
    }
  }, [lastCommit])

  const handleReindex = async () => {
    if (!selectedRepo) return
    
    setIsIndexing(true)
    
    try {
      const repoPath = `/tmp/repos/${selectedRepo.full_name?.replace('/', '_') || selectedRepo.fullName?.replace('/', '_')}`
      
      // Call the index-repo API endpoint
      const response = await fetch('/api/index-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo: selectedRepo,
          repoPath
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Re-indexing started:', result.message)
        
        toast({
          title: "Re-indexing Started",
          description: result.message,
        })
      } else {
        console.error('Failed to start re-indexing')
        toast({
          title: "Re-indexing Failed",
          description: "Failed to start re-indexing. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error during re-indexing:', error)
      toast({
        title: "Re-indexing Error",
        description: "An error occurred while re-indexing. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Keep the loading state for a bit to show the user something happened
      setTimeout(() => setIsIndexing(false), 2000)
    }
  }

  if (!selectedRepo) {
    return null
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
      <div className="flex items-center gap-3">
        <Avatar className="w-6 h-6">
          <AvatarImage src={selectedRepo.avatar || "/placeholder.svg"} />
          <AvatarFallback>{selectedRepo.org?.[0] || 'R'}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <span className="font-medium">{selectedRepo.fullName}</span>
          <Badge variant="outline" className="text-xs gap-1">
            <GitBranch className="w-3 h-3" />
            {selectedRepo.branch}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">Last indexed: {selectedRepo.lastCommit}</div>
      </div>

      <Button variant="ghost" size="sm" onClick={handleReindex} disabled={isIndexing} className="shadow-focus">
        <RefreshCw className={`w-4 h-4 mr-2 ${isIndexing ? "animate-spin" : ""}`} />
        {isIndexing ? "Re-indexing..." : "Re-index"}
      </Button>
    </div>
  )
}
