"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Github } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

// Mock data
const mockRepos = [
  {
    id: 1,
    name: "web-app",
    org: "acme",
    fullName: "acme/web-app",
    description: "Main web application",
    updatedAt: "2 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    name: "api-server",
    org: "acme",
    fullName: "acme/api-server",
    description: "Backend API service",
    updatedAt: "1 day ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    name: "mobile-app",
    org: "acme",
    fullName: "acme/mobile-app",
    description: "React Native mobile app",
    updatedAt: "3 days ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const mockOrgs = ["acme", "personal"]

export default function RepoPickerPage() {
  const [selectedOrg, setSelectedOrg] = useState("acme")
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAuth()
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

  const filteredRepos = mockRepos.filter(
    (repo) => repo.org === selectedOrg && repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectRepo = (repo: (typeof mockRepos)[0]) => {
    // Mock repo selection - store in localStorage for demo
    localStorage.setItem("selectedRepo", JSON.stringify(repo))
    router.push("/plan")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Import GitHub Repository
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedOrg} onValueChange={setSelectedOrg}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                {mockOrgs.map((org) => (
                  <TabsTrigger key={org} value={org} className="capitalize">
                    {org}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 shadow-focus"
                />
              </div>

              {mockOrgs.map((org) => (
                <TabsContent key={org} value={org} className="space-y-3">
                  {filteredRepos.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No repos found. Check your GitHub org access.</p>
                    </div>
                  ) : (
                    filteredRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 shadow-transition"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={repo.avatar || "/placeholder.svg"} alt={repo.org} />
                            <AvatarFallback>{repo.org[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{repo.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {repo.description} • Updated {repo.updatedAt}
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => handleSelectRepo(repo)} variant="outline" className="shadow-focus">
                          Select
                        </Button>
                      </div>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
