"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlaneTakeoff, Settings, User, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  {
    title: "Plan",
    href: "/plan",
    icon: PlaneTakeoff,
  },
  {
    title: "Processes",
    href: "/processes",
    icon: Settings,
  },
  {
    title: "Account",
    href: "/account",
    icon: User,
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 shadow-focus"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-card border-r border-border shadow-transition",
          "w-72 md:w-18",
          isCollapsed ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-background font-bold text-sm">S</span>
              </div>
              <span className="font-semibold md:hidden">Shadow</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 shadow-focus shadow-transition",
                        "md:justify-center md:px-2",
                        isActive && "bg-muted",
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="md:hidden">{item.title}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}
    </>
  )
}
