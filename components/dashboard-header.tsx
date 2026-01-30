"use client"

import { Diamond, Moon, Menu } from "lucide-react"
import { useStore } from "@/lib/store"

interface DashboardHeaderProps {
  onToggleSidebar: () => void
  isSidebarCollapsed: boolean
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { settings } = useStore()

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <Diamond className="w-5 h-5 text-cyan-400" />
        <span className="font-medium text-foreground">{settings.shopName}</span>
      </div>
      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
        <Moon className="w-5 h-5 text-muted-foreground" />
      </button>
    </header>
  )
}
