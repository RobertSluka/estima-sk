import { NextResponse } from "next/server"
import {
  SESSION_COOKIE,
  authConfigured,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminCredentials,
  type SessionUser,
} from "@/lib/auth"
import { accountsConfigured, verifyUser } from "@/lib/backend"

export async function POST(request: Request) {
  if (!authConfigured()) {
    // No signing secret configured — refuse rather than accept anything.
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 })
  }

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }
  const email = body.email ?? ""
  const password = body.password ?? ""

  // Database users first; the env-var admin account remains as a fallback.
  let user: SessionUser | null = null
  if (accountsConfigured()) {
    const res = await verifyUser(email, password)
    if (res.status === 200 && res.data?.user) {
      const u = res.data.user
      user = {
        id: u.id,
        email: u.email,
        name: u.name ?? u.email,
        role: "user",
        picture: u.picture_url,
      }
    }
  }
  if (!user) {
    user = verifyAdminCredentials(email, password)
  }
  if (!user) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 })
  }

  const token = createSessionToken(user)
  if (!token) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 })
  }

  const res = NextResponse.json({ user })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return res
}
