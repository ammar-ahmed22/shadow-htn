"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, CornerDownLeft } from "lucide-react"
import type { ChatMessage } from "@/lib/types"
import { PlanCard } from "./plan-card"
import { cn } from "@/lib/utils"

interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  onSuggestedPrompt: (prompt: string) => void
  suggestedPrompts: string[]
  isLoading?: boolean
}

export function ChatPanel({
  messages,
  onSendMessage,
  onSuggestedPrompt,
  suggestedPrompts,
  isLoading = false,
}: ChatPanelProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestedClick = (prompt: string) => {
    onSuggestedPrompt(prompt)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💭</span>
            </div>
            <h3 className="text-lg font-medium mb-2">What would you like Shadow to do?</h3>
            <p className="text-muted-foreground mb-6">
              Describe your development task and Shadow will create a detailed plan.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.type === "user" ? "justify-end" : "justify-start")}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-background font-bold text-sm">S</span>
                </div>
              )}

              <div className={cn("max-w-2xl", message.type === "user" ? "order-first" : "")}>
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm",
                    message.type === "user" ? "bg-foreground text-background ml-auto" : "bg-muted",
                  )}
                >
                  {message.content}
                </div>

                {message.plan && (
                  <div className="mt-4">
                    <PlanCard plan={message.plan} />
                  </div>
                )}
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-foreground font-medium text-sm">U</span>
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-background font-bold text-sm">S</span>
            </div>
            <div className="bg-muted rounded-lg px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                <span className="text-muted-foreground">Shadow is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedClick(prompt)}
                className="text-xs shadow-focus bg-transparent"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-6">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want Shadow to do..."
            className="min-h-[60px] pr-12 resize-none shadow-focus"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <CornerDownLeft className="w-3 h-3 mr-1" />
              Send
            </Badge>
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-8 w-8 shadow-focus">
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
