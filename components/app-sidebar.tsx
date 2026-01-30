"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Settings, LogOut, Diamond, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sales & Invoice", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface AppSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useStore()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <Diamond className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-sidebar-foreground">Vinayak Jewellers</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {!isCollapsed && (
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">Management</p>
        )}
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isCollapsed && "justify-center px-0",
                    isActive
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-sidebar-accent/50 transition-colors w-full",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  )
}
