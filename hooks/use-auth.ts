"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  const login = async () => {
    setError(null)
    try {
      await signIn('github', { callbackUrl: '/repo-picker' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"
      setError(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const clearError = () => {
    setError(null)
  }

  return {
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    error,
    login,
    logout,
    clearError,
    accessToken: session?.accessToken
  }
}
