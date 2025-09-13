// Mock authentication utilities
export interface User {
  id: string
  login: string
  name: string
  avatar_url: string
  email?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Mock GitHub OAuth flow
export const mockGitHubAuth = async (): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate random auth failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("GitHub authentication failed. Please try again.")
  }

  return {
    id: "12345",
    login: "johndoe",
    name: "John Doe",
    avatar_url: "/placeholder.svg?height=32&width=32",
    email: "john@example.com",
  }
}

// Auth state management
export const getStoredAuth = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, isAuthenticated: false, isLoading: false, error: null }
  }

  const stored = localStorage.getItem("shadow_auth")
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return {
        user: parsed.user,
        isAuthenticated: !!parsed.user,
        isLoading: false,
        error: null,
      }
    } catch {
      localStorage.removeItem("shadow_auth")
    }
  }

  return { user: null, isAuthenticated: false, isLoading: false, error: null }
}

export const setStoredAuth = (user: User | null) => {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("shadow_auth", JSON.stringify({ user }))
  } else {
    localStorage.removeItem("shadow_auth")
  }
}

export const clearAuth = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("shadow_auth")
  localStorage.removeItem("selectedRepo")
}
