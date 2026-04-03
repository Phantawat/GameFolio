import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { APP_SESSION_COOKIE } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  
  // Check if we have an active session
  const { data: { user }, error } = await (await supabase).auth.getUser()

  if (user) {
    await (await supabase).auth.signOut()
  }

  const response = NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })

  response.cookies.delete(APP_SESSION_COOKIE)

  return response
}
