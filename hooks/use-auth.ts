"use client"

import { useState, useEffect } from "react"
import { mockGitHubAuth, getStoredAuth, setStoredAuth, clearAuth, type AuthState } from "@/lib/auth"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // Initialize auth state from localStorage
    const stored = getStoredAuth()
    setAuthState(stored)
  }, [])

  const login = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const user = await mockGitHubAuth()
      setStoredAuth(user)
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const logout = () => {
    clearAuth()
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }))
  }

  return {
    ...authState,
    login,
    logout,
    clearError,
  }
}
