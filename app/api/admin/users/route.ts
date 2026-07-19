import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminGuard"
import { accountsConfigured, listUsers } from "@/lib/backend"

// Admin-only user directory. Guarded by an admin session; the internal key
// never leaves the server.
export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  if (!accountsConfigured()) {
    return NextResponse.json({ error: "accounts_not_configured" }, { status: 503 })
  }

  const url = new URL(request.url)
  const limit = Number(url.searchParams.get("limit") ?? 50)
  const offset = Number(url.searchParams.get("offset") ?? 0)
  const q = url.searchParams.get("q") ?? undefined

  const res = await listUsers({
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
    q,
  })
  if (res.status !== 200 || !res.data) {
    return NextResponse.json({ error: "backend_error" }, { status: 502 })
  }
  return NextResponse.json(res.data)
}
