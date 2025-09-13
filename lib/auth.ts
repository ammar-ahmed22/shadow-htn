// GitHub user interface
export interface GitHubUser {
  id: string
  login: string
  name: string | null
  avatar_url: string
  email?: string | null
}

// Repository fetching function
export const fetchUserRepositories = async (accessToken: string) => {
  const response = await fetch('/api/repos', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch repositories')
  }

  return response.json()
}

// Utility functions for localStorage management
export const clearAuth = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("selectedRepo")
}
