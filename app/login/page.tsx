"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Redirect if already authenticated
    if (mounted && isAuthenticated) {
      const hasSelectedRepo = localStorage.getItem("selectedRepo")
      router.push(hasSelectedRepo ? "/plan" : "/repo-picker")
    }
  }, [isAuthenticated, mounted, router])

  const handleGitHubAuth = async () => {
    try {
      await login()
      // Check if user has already selected a repo
      const hasSelectedRepo = localStorage.getItem("selectedRepo")
      router.push(hasSelectedRepo ? "/plan" : "/repo-picker")
    } catch (error) {
      // Error is handled by useAuth hook
    }
  }

  const handleLater = () => {
    localStorage.setItem("shadow_demo_mode", "true")
    router.push("/plan")
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-panel">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-xl">S</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">Connect with GitHub</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">Get started with Shadow in seconds</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-auto p-1 text-destructive-foreground hover:text-destructive-foreground"
                >
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 flex-shrink-0" />
              <span>Shadow links PRs to tickets automatically.</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 flex-shrink-0" />
              <span>Status sync when PRs open/merge/revert.</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 flex-shrink-0" />
              <span>Shadow does not ask for code read permissions beyond what you approve.</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGitHubAuth}
              disabled={isLoading}
              className="w-full h-12 shadow-transition shadow-focus"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Continue with GitHub
                </>
              )}
            </Button>

            <button
              onClick={handleLater}
              disabled={isLoading}
              className="w-full text-sm text-muted-foreground hover:text-foreground shadow-transition shadow-focus rounded-lg p-2 disabled:opacity-50"
            >
              I'll do this later
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
