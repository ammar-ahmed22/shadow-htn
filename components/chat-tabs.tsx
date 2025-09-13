"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatTab } from "@/lib/types"

interface ChatTabsProps {
  tabs: ChatTab[]
  activeTabId: string
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
  repoName: string
}

export function ChatTabs({ 
  tabs, 
  activeTabId, 
  onTabSelect, 
  onTabClose, 
  onNewTab,
  repoName 
}: ChatTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border/50 bg-muted/20 px-2 py-1 text-xs">
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors min-w-0 max-w-32 ${
              activeTabId === tab.id
                ? "bg-background/80 text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/40"
            }`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="truncate">{tab.title}</span>
            {tabs.length > 1 && (
              <button
                className="ml-1 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={onNewTab}
        className="p-1 hover:bg-background/40 rounded"
      >
        <Plus className="h-3 w-3" />
      </button>
      
      <div className="text-xs text-muted-foreground/70 shrink-0 ml-2 truncate max-w-24">
        {repoName}
      </div>
    </div>
  )
}
