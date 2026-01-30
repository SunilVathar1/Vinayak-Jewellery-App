"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { useStore } from "@/lib/store"

export default function Home() {
  const { isAuthenticated } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  return <LoginForm />
}
