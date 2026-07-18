import { NextResponse } from "next/server"
import {
  SESSION_COOKIE,
  authConfigured,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth"
import { accountsConfigured, registerUser } from "@/lib/backend"

export async function POST(request: Request) {
  if (!accountsConfigured() || !authConfigured()) {
    return NextResponse.json({ error: "registration_not_configured" }, { status: 503 })
  }

  let body: { email?: string; password?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }
  const email = (body.email ?? "").trim()
  const password = body.password ?? ""
  if (!email || password.length < 8) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 })
  }

  const res = await registerUser(email, password, body.name?.trim() || undefined)
  if (res.status === 409) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 })
  }
  if (res.status !== 200 || !res.data?.user) {
    return NextResponse.json({ error: "registration_failed" }, { status: 502 })
  }

  // Auto sign-in after registration.
  const u = res.data.user
  const token = createSessionToken({
    id: u.id,
    email: u.email,
    name: u.name ?? u.email,
    role: "user",
    picture: u.picture_url,
  })
  if (!token) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 })
  }
  const out = NextResponse.json({ user: res.data.user })
  out.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return out
}
