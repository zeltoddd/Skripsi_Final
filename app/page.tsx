// app/page.tsx — Root redirect (server component)
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const session = await auth()
  if (session) redirect('/chat')
  redirect('/login')
}
