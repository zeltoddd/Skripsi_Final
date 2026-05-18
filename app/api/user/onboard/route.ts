// app/api/user/onboard/route.ts — Save jurusan after onboarding
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cache } from "@/lib/cache"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

   const { major, grade } = await req.json()

   await prisma.user.update({
     where: { id: session.user.id },
     data: { major, grade },
   })

   // Invalidate cache
   cache.delete(`user:${session.user.id}`)

  return NextResponse.json({ success: true })
}
