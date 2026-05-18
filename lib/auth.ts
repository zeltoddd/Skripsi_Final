// lib/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"
import { cache } from "@/lib/cache"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT is more stable for Middleware
  ...authConfig,
  callbacks: {
    async session({ session, token }) {
      // In JWT strategy, we get the user ID from the token
      if (session.user && token.sub) {
        session.user.id = token.sub
        
        // Fetch fresh data from DB (cached to avoid redundant queries to Neon)
        const cacheKey = `user:${token.sub}`;
        let dbUser = cache.get(cacheKey) as { role: any; major: string | null; grade: string | null } | null;
        
        if (!dbUser) {
          dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, major: true, grade: true }
          });
          if (dbUser) {
            cache.set(cacheKey, dbUser, 60 * 1000); // Cache for 1 minute
          }
        }
        
        if (dbUser) {
          ;(session.user as any).role = dbUser.role
          ;(session.user as any).major = dbUser.major
          ;(session.user as any).grade = dbUser.grade
        }
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      // On first sign in, user is populated
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: "/login",
  },
})

