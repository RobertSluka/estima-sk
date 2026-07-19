// Server-side admin gate for the /api/admin/* routes. Never import from a
// client component — it reads the httpOnly session cookie and the backend
// internal key.
//
// The env-var admin (no backend id) is trusted from its signed token. A
// database user's token role is always minted as "user", so admin status is
// re-checked against the backend on every call — promotions and demotions
// take effect immediately, and a stale token can never assert admin.

import { cookies } from "next/headers"
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from "@/lib/auth"
import { getUser } from "@/lib/backend"

export async function requireAdmin(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  const user = verifySessionToken(token)
  if (!user) return null
  // Env-var admin: role is baked into the signed token, no backend row.
  if (user.role === "admin" && user.id == null) return user
  // Database user: trust only the backend's current role.
  if (user.id != null) {
    const res = await getUser(user.id)
    if (res.status === 200 && res.data?.user?.role === "admin") {
      return { ...user, role: "admin" }
    }
  }
  return null
}
