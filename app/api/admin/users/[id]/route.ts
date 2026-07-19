import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminGuard"
import { accountsConfigured, setUserAccess } from "@/lib/backend"

// Admin-only: grant/revoke a user's Pro access or admin role.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  if (!accountsConfigured()) {
    return NextResponse.json({ error: "accounts_not_configured" }, { status: 503 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  let body: { role?: "user" | "admin"; pro_override?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  const access: { role?: "user" | "admin"; pro_override?: boolean } = {}
  if (body.role === "user" || body.role === "admin") access.role = body.role
  if (typeof body.pro_override === "boolean") access.pro_override = body.pro_override
  if (access.role === undefined && access.pro_override === undefined) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 })
  }

  const res = await setUserAccess(id, access)
  if (res.status === 404) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 })
  }
  if (res.status !== 200 || !res.data?.user) {
    return NextResponse.json({ error: "backend_error" }, { status: 502 })
  }
  return NextResponse.json({ user: res.data.user })
}
