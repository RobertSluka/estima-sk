import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"
import { accountsConfigured, updateUserProfile } from "@/lib/backend"

// Self-service profile edit (display name) for the signed-in database user.
export async function PATCH(request: Request) {
  if (!accountsConfigured()) {
    return NextResponse.json({ error: "accounts_not_configured" }, { status: 503 })
  }
  const user = verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }
  if (user.role !== "user" || !user.id) {
    // The env-var admin has no backend row to edit.
    return NextResponse.json({ error: "not_editable" }, { status: 400 })
  }

  let body: { name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }
  const name = (body.name ?? "").trim()
  if (!name) {
    return NextResponse.json({ error: "name_required" }, { status: 400 })
  }

  const res = await updateUserProfile(user.id, { name })
  if (res.status !== 200 || !res.data?.user) {
    return NextResponse.json({ error: "update_failed" }, { status: 502 })
  }
  return NextResponse.json({ user: res.data.user })
}
