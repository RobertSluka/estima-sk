import { NextResponse } from "next/server"
import {
  SESSION_COOKIE,
  authConfigured,
  createSessionToken,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/auth"

export async function POST(request: Request) {
  if (!authConfigured()) {
    // No ADMIN_PASSWORD configured — refuse rather than accept anything.
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 })
  }

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  const user = verifyCredentials(body.email ?? "", body.password ?? "")
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
