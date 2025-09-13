import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      login?: string
    }
  }

  interface JWT {
    accessToken?: string
    login?: string
  }

  interface Profile {
    login?: string
  }
}
