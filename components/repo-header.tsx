"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {  GitBranch } from "lucide-react"
import { useEffect, useState } from "react"
import type { Repository } from "@/lib/types"

export function RepoHeader() {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [lastCommit] = useState("abc123f")

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
    </div>
  )
}
