"use client"

import { useState, useEffect } from "react"
import { ChatTab, ChatMessage } from "@/lib/types"

export function useChatTabs(repoId: string) {
  const [tabs, setTabs] = useState<ChatTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>("")

  // Load tabs for current repository
  useEffect(() => {
    if (!repoId) return

    const storedTabs = localStorage.getItem(`chatTabs_${repoId}`)
    const storedActiveTab = localStorage.getItem(`activeTab_${repoId}`)
    
    if (storedTabs) {
      const parsedTabs = JSON.parse(storedTabs)
      setTabs(parsedTabs)
      
      if (storedActiveTab && parsedTabs.find((tab: ChatTab) => tab.id === storedActiveTab)) {
        setActiveTabId(storedActiveTab)
      } else if (parsedTabs.length > 0) {
        setActiveTabId(parsedTabs[0].id)
      }
    } else {
      // Create initial tab for new repository
      const initialTab = createNewTab(repoId)
      setTabs([initialTab])
      setActiveTabId(initialTab.id)
    }
  }, [repoId])

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (repoId && tabs.length > 0) {
      localStorage.setItem(`chatTabs_${repoId}`, JSON.stringify(tabs))
    }
  }, [tabs, repoId])

  // Save active tab whenever it changes
  useEffect(() => {
    if (repoId && activeTabId) {
      localStorage.setItem(`activeTab_${repoId}`, activeTabId)
    }
  }, [activeTabId, repoId])

  const createNewTab = (repoId: string): ChatTab => {
    const now = new Date().toISOString()
    return {
      id: `tab-${Date.now()}`,
      title: "New Chat",
      repoId,
      messages: [],
      createdAt: now,
      lastActivity: now
    }
  }

  const addNewTab = () => {
    const newTab = createNewTab(repoId)
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return // Don't close the last tab
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId))
    
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId)
      setActiveTabId(remainingTabs[0]?.id || "")
    }
  }

  const updateTabMessages = (tabId: string, messages: ChatMessage[]) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { 
            ...tab, 
            messages, 
            lastActivity: new Date().toISOString(),
            title: messages.length > 0 ? generateTabTitle(messages[0].content) : "New Chat"
          }
        : tab
    ))
  }

  const generateTabTitle = (firstMessage: string): string => {
    // Generate a short title from the first message
    const words = firstMessage.split(' ').slice(0, 4)
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '')
  }

  const getActiveTab = (): ChatTab | undefined => {
    return tabs.find(tab => tab.id === activeTabId)
  }

  const getActiveMessages = (): ChatMessage[] => {
    return getActiveTab()?.messages || []
  }

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    addNewTab,
    closeTab,
    updateTabMessages,
    getActiveTab,
    getActiveMessages
  }
}
