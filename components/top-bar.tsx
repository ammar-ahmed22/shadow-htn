"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Github, LogOut, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function TopBar() {
  const [selectedRepo, setSelectedRepo] = useState<any>(null)
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Get selected repo from localStorage (mock)
    const repo = localStorage.getItem("selectedRepo")
    if (repo) {
      setSelectedRepo(JSON.parse(repo))
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleRepoSelect = () => {
    router.push("/repo-picker")
  }

  return (
    <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Repository Selector */}
      <div className="flex items-center gap-4">
        {selectedRepo ? (
          <Button variant="outline" className="gap-2 shadow-focus bg-transparent" onClick={handleRepoSelect}>
            <Avatar className="w-4 h-4">
              <AvatarImage src={selectedRepo.avatar || "/placeholder.svg"} />
              <AvatarFallback>{selectedRepo.org[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{selectedRepo.fullName}</span>
            <Badge variant="secondary" className="text-xs">
              main
            </Badge>
            <ChevronDown className="w-3 h-3" />
          </Button>
        ) : (
          <Button variant="outline" className="gap-2 shadow-focus bg-transparent" onClick={handleRepoSelect}>
            <Github className="w-4 h-4" />
            Import GitHub Repo
          </Button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <Badge variant="secondary" className="gap-1">
          <div className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-red-500"}`} />
          GitHub: {isAuthenticated ? "Connected" : "Connect"}
        </Badge>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shadow-focus">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback>{user?.name?.[0] || user?.login?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user && (
              <>
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.name || user.login}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => router.push("/account")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
