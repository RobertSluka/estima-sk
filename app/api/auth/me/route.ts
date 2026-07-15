import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value
  const user = verifySessionToken(token)
  if (!user) {
    return NextResponse.json({ authenticated: false })
  }
  return NextResponse.json({ authenticated: true, user })
}
