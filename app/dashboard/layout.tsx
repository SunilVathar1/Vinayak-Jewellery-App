"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useStore()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem("vinayak_sidebar_collapsed")
    if (saved !== null) {
      setSidebarCollapsed(saved === "true")
    }
  }, [])

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("vinayak_sidebar_collapsed", newState.toString())
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar isCollapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <DashboardHeader onToggleSidebar={handleToggleSidebar} isSidebarCollapsed={sidebarCollapsed} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
