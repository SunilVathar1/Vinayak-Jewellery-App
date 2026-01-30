"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, Diamond, AlertCircle, Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const result = login(username, password)
    
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1525] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl p-8 border border-border">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Diamond className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Vinayak Jewellers</h1>
            <p className="text-primary text-sm mt-1">Digital Jewelry Management System</p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Secure Login</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login to Dashboard"
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[#1a2234] rounded-lg border border-border">
            <p className="text-primary font-semibold mb-2">Demo Credentials:</p>
            <p className="text-muted-foreground text-sm">Username: admin</p>
            <p className="text-muted-foreground text-sm">Password: admin123</p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("vinayak_user")
                localStorage.removeItem("vinayak_session")
                window.location.reload()
              }}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Reset to default credentials
            </button>
          </div>

          {/* Security Info */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Session expires after 8 hours of inactivity
          </p>
        </div>
      </div>
    </div>
  )
}
