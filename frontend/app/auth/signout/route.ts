import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const supabase = createClient()
  
  // Check if we have an active session
  const { data: { user }, error } = await (await supabase).auth.getUser()

  if (user) {
    await (await supabase).auth.signOut()
  }

  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}
