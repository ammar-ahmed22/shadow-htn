"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, LogOut, Settings, CreditCard, Moon, CheckCircle2, XCircle, ExternalLink, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const [mounted, setMounted] = useState(false)
  const [defaultRepo, setDefaultRepo] = useState("acme/web-app") // Updated default value
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      const isDemoMode = localStorage.getItem("shadow_demo_mode")
      if (!isDemoMode) {
        router.push("/login")
        return
      }
    }
  }, [isAuthenticated, mounted, router])

  useEffect(() => {
    // Load default repo setting
    const selectedRepo = localStorage.getItem("selectedRepo")
    if (selectedRepo) {
      const repo = JSON.parse(selectedRepo)
      setDefaultRepo(repo.fullName)
    }
  }, [])

  const handleSignOut = () => {
    logout()
    router.push("/login")
  }

  const handleDisconnectGitHub = () => {
    logout()
    router.push("/login")
  }

  const handleConnectGitHub = () => {
    router.push("/login")
  }

  const handleDefaultRepoChange = (value: string) => {
    setDefaultRepo(value)
    // In a real app, this would save to user preferences
    console.log("Default repo changed to:", value)
  }

  if (!mounted) {
    return null
  }

  const mockRepos = ["acme/web-app", "acme/api-server", "acme/mobile-app", "personal/portfolio"]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="shadow-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information and account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatar_url || "/placeholder.svg?height=80&width=80"} />
              <AvatarFallback className="text-2xl">{user?.name?.[0] || user?.login?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <div className="text-lg font-medium">{user?.name || "Demo User"}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">GitHub Username</Label>
                <div className="text-muted-foreground">@{user?.login || "demouser"}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || "demo@example.com"}
                disabled
                className="shadow-focus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub Handle</Label>
              <Input id="github" value={`@${user?.login || "demouser"}`} disabled className="shadow-focus" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Connection */}
      <Card className="shadow-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Connection
          </CardTitle>
          <CardDescription>Manage your GitHub integration and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-background" />
              </div>
              <div>
                <div className="font-medium">GitHub Account</div>
                <div className="text-sm text-muted-foreground">
                  {isAuthenticated ? `Connected as @${user?.login || "demouser"}` : "Not connected"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Connected
                  </Badge>
                  <Button variant="outline" onClick={handleDisconnectGitHub} className="shadow-focus bg-transparent">
                    Disconnect
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="w-3 h-3 text-red-500" />
                    Disconnected
                  </Badge>
                  <Button onClick={handleConnectGitHub} className="shadow-focus">
                    Connect
                  </Button>
                </>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
              <div className="font-medium mb-2">Permissions granted:</div>
              <ul className="space-y-1">
                <li>• Read repository metadata</li>
                <li>• Create pull requests</li>
                <li>• Read and write issues</li>
                <li>• Access to public repositories</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Repository */}
      <Card className="shadow-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Preferences
          </CardTitle>
          <CardDescription>Configure your default settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-repo">Default Repository</Label>
            <Select value={defaultRepo} onValueChange={handleDefaultRepoChange}>
              <SelectTrigger className="shadow-focus">
                <SelectValue placeholder="Select a default repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default</SelectItem> {/* Updated value prop */}
                {mockRepos.map((repo) => (
                  <SelectItem key={repo} value={repo}>
                    {repo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This repository will be selected by default when you open Shadow
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5" />
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">Shadow uses dark mode by default</div>
                </div>
              </div>
              <Badge variant="secondary">Locked</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="shadow-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing
          </CardTitle>
          <CardDescription>Manage your subscription and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium">Shadow Pro</div>
              <div className="text-sm text-muted-foreground">Free during beta</div>
            </div>
            <Badge variant="secondary">Beta</Badge>
          </div>

          <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
            <div className="font-medium mb-2">What's included:</div>
            <ul className="space-y-1">
              <li>• Unlimited repositories</li>
              <li>• Advanced AI planning</li>
              <li>• Priority support</li>
              <li>• Early access to new features</li>
            </ul>
          </div>

          <Button variant="outline" disabled className="w-full shadow-focus bg-transparent">
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage Billing (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="shadow-panel border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that affect your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut} className="shadow-focus">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
