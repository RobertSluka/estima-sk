import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"
import { accountsConfigured, changeUserPassword } from "@/lib/backend"

// Self-service password change (or first-time set for a Google-only account).
export async function POST(request: Request) {
  if (!accountsConfigured()) {
    return NextResponse.json({ error: "accounts_not_configured" }, { status: 503 })
  }
  const user = verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }
  if (user.role !== "user" || !user.id) {
    return NextResponse.json({ error: "not_editable" }, { status: 400 })
  }

  let body: { current_password?: string; new_password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }
  const newPassword = body.new_password ?? ""
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 })
  }

  const res = await changeUserPassword(user.id, {
    new_password: newPassword,
    current_password: body.current_password,
  })
  if (res.status === 403) {
    return NextResponse.json({ error: "wrong_password" }, { status: 403 })
  }
  if (res.status !== 200 || !res.data?.user) {
    return NextResponse.json({ error: "change_failed" }, { status: 502 })
  }
  return NextResponse.json({ user: res.data.user })
}
