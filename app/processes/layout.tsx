import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { TopBar } from "@/components/top-bar"

export default function ProcessesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="md:pl-18">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
