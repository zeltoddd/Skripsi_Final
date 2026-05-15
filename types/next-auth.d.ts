// types/next-auth.d.ts — Type augmentation for NextAuth session
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      major: string | null
      grade: string | null
      schoolName: string | null
    } & DefaultSession["user"]
  }
}
