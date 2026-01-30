"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface SaleItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Sale {
  id: string
  invoiceNumber: string
  date: string
  customerName: string
  customerPhone: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "Cash" | "Card" | "UPI" | "Bank Transfer"
  status: "Paid" | "Pending" | "Cancelled"
}

export interface ShopSettings {
  shopName: string
  gstin: string
  address: string
  phone1: string
  phone2: string
  tagline: string
  termsAndConditions: string
}

export interface User {
  username: string
  passwordHash: string
  lastLogin: string | null
  loginAttempts: number
  lockedUntil: string | null
}

interface StoreContextType {
  sales: Sale[]
  addSale: (sale: Omit<Sale, "id" | "invoiceNumber">) => Sale
  updateSale: (id: string, sale: Partial<Sale>) => void
  deleteSale: (id: string) => void
  getSale: (id: string) => Sale | undefined
  settings: ShopSettings
  updateSettings: (settings: Partial<ShopSettings>) => void
  user: User
  updatePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string }
  isAuthenticated: boolean
  login: (username: string, password: string) => { success: boolean; message: string }
  logout: () => void
  exportData: () => string
  importData: (data: string) => boolean
  getNextInvoiceNumber: () => string
  sessionExpiresAt: Date | null
}

const defaultSettings: ShopSettings = {
  shopName: "Vinayak Jewellers",
  gstin: "29FJJPP4161F1ZX",
  address: "223/A, Yarganvi Road, Near Government High School,\nTq : Savadatti - SHIVAPUR-SAVADATTI   Dist : Belagavi.",
  phone1: "97431 79591",
  phone2: "89706 05030",
  tagline: "|| Shri Kalikadevi Prasanna ||",
  termsAndConditions: "* Replace in only 7 days",
}

// Simple hash function for client-side (for demo purposes)
// In production, use bcrypt on server-side
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + str.length.toString(16).padStart(2, '0')
}

function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash
}

const DEFAULT_PASSWORD = "admin123"
const DEFAULT_USERNAME = "admin"

const defaultUser: User = {
  username: DEFAULT_USERNAME,
  passwordHash: simpleHash(DEFAULT_PASSWORD),
  lastLogin: null,
  loginAttempts: 0,
  lockedUntil: null,
}

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15
const SESSION_DURATION_HOURS = 8

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([])
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings)
  const [user, setUser] = useState<User>(defaultUser)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSales = localStorage.getItem("vinayak_sales")
      const storedSettings = localStorage.getItem("vinayak_settings")
      const storedUser = localStorage.getItem("vinayak_user")
      const storedSession = localStorage.getItem("vinayak_session")

      if (storedSales) setSales(JSON.parse(storedSales))
      if (storedSettings) setSettings(JSON.parse(storedSettings))
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        // Ensure loginAttempts is a valid number
        setUser({
          ...defaultUser,
          ...parsedUser,
          loginAttempts: typeof parsedUser.loginAttempts === 'number' && !isNaN(parsedUser.loginAttempts) 
            ? parsedUser.loginAttempts 
            : 0
        })
      }
      
      // Check session validity
      if (storedSession) {
        const session = JSON.parse(storedSession)
        const expiresAt = new Date(session.expiresAt)
        if (expiresAt > new Date()) {
          setIsAuthenticated(true)
          setSessionExpiresAt(expiresAt)
        } else {
          // Session expired, clear it
          localStorage.removeItem("vinayak_session")
        }
      }
      
      setIsLoaded(true)
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("vinayak_sales", JSON.stringify(sales))
    }
  }, [sales, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("vinayak_settings", JSON.stringify(settings))
    }
  }, [settings, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("vinayak_user", JSON.stringify(user))
    }
  }, [user, isLoaded])

  // Session expiry checker
  useEffect(() => {
    if (!isAuthenticated || !sessionExpiresAt) return

    const checkSession = () => {
      if (sessionExpiresAt && new Date() > sessionExpiresAt) {
        logout()
      }
    }

    const interval = setInterval(checkSession, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [isAuthenticated, sessionExpiresAt])

  const getNextInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const existingSales = sales.filter((s) => s.invoiceNumber.includes(year.toString()))
    const nextNumber = existingSales.length + 1
    return `VJ-${year}-${nextNumber.toString().padStart(3, "0")}`
  }

  const addSale = (saleData: Omit<Sale, "id" | "invoiceNumber">): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID(),
      invoiceNumber: getNextInvoiceNumber(),
    }
    setSales((prev) => [...prev, newSale])
    return newSale
  }

  const updateSale = (id: string, saleData: Partial<Sale>) => {
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...saleData } : s)))
  }

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id))
  }

  const getSale = (id: string) => {
    return sales.find((s) => s.id === id)
  }

  const updateSettings = (newSettings: Partial<ShopSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const updatePassword = (currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    // Validate current password
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return { success: false, message: "Current password is incorrect" }
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return { success: false, message: "New password must be at least 6 characters long" }
    }

    if (newPassword === currentPassword) {
      return { success: false, message: "New password must be different from current password" }
    }

    // Update password
    setUser((prev) => ({ 
      ...prev, 
      passwordHash: simpleHash(newPassword),
      loginAttempts: 0,
      lockedUntil: null
    }))
    
    return { success: true, message: "Password updated successfully" }
  }

  const login = (username: string, password: string): { success: boolean; message: string } => {
    // Check if account is locked
    if (user.lockedUntil) {
      const lockedUntilDate = new Date(user.lockedUntil)
      if (lockedUntilDate > new Date()) {
        const minutesLeft = Math.ceil((lockedUntilDate.getTime() - Date.now()) / 60000)
        return { 
          success: false, 
          message: `Account is locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.` 
        }
      } else {
        // Lockout period has passed, reset attempts
        setUser((prev) => ({ ...prev, loginAttempts: 0, lockedUntil: null }))
      }
    }

    // Validate credentials
    if (username !== user.username) {
      return { success: false, message: "Invalid username or password" }
    }

    if (!verifyPassword(password, user.passwordHash)) {
      const newAttempts = user.loginAttempts + 1
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000).toISOString()
        setUser((prev) => ({ 
          ...prev, 
          loginAttempts: newAttempts,
          lockedUntil 
        }))
        return { 
          success: false, 
          message: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.` 
        }
      }
      
      setUser((prev) => ({ ...prev, loginAttempts: newAttempts }))
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - newAttempts
      return { 
        success: false, 
        message: `Invalid username or password. ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining.` 
      }
    }

    // Successful login
    const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000)
    const session = {
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem("vinayak_session", JSON.stringify(session))
    setSessionExpiresAt(expiresAt)
    setIsAuthenticated(true)
    setUser((prev) => ({ 
      ...prev, 
      lastLogin: new Date().toISOString(),
      loginAttempts: 0,
      lockedUntil: null
    }))
    
    return { success: true, message: "Login successful" }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setSessionExpiresAt(null)
    localStorage.removeItem("vinayak_session")
  }

  const exportData = (): string => {
    const data = {
      sales,
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0"
    }
    return JSON.stringify(data, null, 2)
  }

  const importData = (dataString: string): boolean => {
    try {
      const data = JSON.parse(dataString)
      if (data.sales) setSales(data.sales)
      if (data.settings) setSettings(data.settings)
      return true
    } catch {
      return false
    }
  }

  if (!isLoaded) {
    return null
  }

  return (
    <StoreContext.Provider
      value={{
        sales,
        addSale,
        updateSale,
        deleteSale,
        getSale,
        settings,
        updateSettings,
        user,
        updatePassword,
        isAuthenticated,
        login,
        logout,
        exportData,
        importData,
        getNextInvoiceNumber,
        sessionExpiresAt,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
