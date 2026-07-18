// Server-side auth core — session cookies for admin + database users.
//
// Two kinds of account share one HMAC-signed, stateless session cookie:
//   - the env-var admin account (ADMIN_EMAIL/ADMIN_PASSWORD), as before
//   - real users stored in estima-sk-backend (e-mail/password or Google),
//     reached through lib/backend.ts — the token then carries the user id
//     and /api/auth/me re-fetches fresh profile + plan from the backend.
//
//   ADMIN_EMAIL     admin login e-mail (default admin@estima.sk)
//   ADMIN_PASSWORD  admin password — while unset the admin account is disabled
//   AUTH_SECRET     cookie-signing key; falls back to a key derived from
//                   ADMIN_PASSWORD so sessions survive restarts without
//                   extra configuration. REQUIRED (directly or via
//                   ADMIN_PASSWORD) for any sign-in to work.
//
// Server-only module: never import from client components.

import { createHmac, timingSafeEqual } from "crypto"

export const SESSION_COOKIE = "estima_session"
const SESSION_TTL_S = 7 * 24 * 60 * 60 // 7 days

export interface SessionUser {
  /** Backend user id; absent for the env-var admin account. */
  id?: number
  email: string
  name: string
  role: "admin" | "user"
  picture?: string | null
}

function adminEmail(): string {
  return process.env.ADMIN_EMAIL || "admin@estima.sk"
}

function secret(): string | null {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return null
  return createHmac("sha256", "estima-auth-secret-v1").update(pw).digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/** True when at least one sign-in method can mint sessions. */
export function authConfigured(): boolean {
  return Boolean(secret())
}

/** True when the env-var admin account is usable. */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

/** Check submitted credentials against the env-var admin account. */
export function verifyAdminCredentials(email: string, password: string): SessionUser | null {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return null
  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail().toLowerCase())
  const passwordOk = safeEqual(password, expected)
  if (!emailOk || !passwordOk) return null
  return { email: adminEmail(), name: "Admin", role: "admin" }
}

/** Mint a signed session token: base64url(payload).base64url(hmac). */
export function createSessionToken(user: SessionUser): string | null {
  const key = secret()
  if (!key) return null
  const payload = Buffer.from(
    JSON.stringify({
      u: user.id ?? null,
      e: user.email,
      n: user.name,
      p: user.picture ?? null,
      r: user.role,
      x: Math.floor(Date.now() / 1000) + SESSION_TTL_S,
    }),
  ).toString("base64url")
  const sig = createHmac("sha256", key).update(payload).digest("base64url")
  return `${payload}.${sig}`
}

/** Validate a session token; returns the user or null (expired/tampered). */
export function verifySessionToken(token: string | undefined): SessionUser | null {
  if (!token) return null
  const key = secret()
  if (!key) return null
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null
  const expected = createHmac("sha256", key).update(payload).digest("base64url")
  if (!safeEqual(sig, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString())
    if (typeof data.x !== "number" || data.x < Date.now() / 1000) return null
    if (data.r !== "admin" && data.r !== "user") return null
    if (data.r === "user" && typeof data.u !== "number") return null
    return {
      id: typeof data.u === "number" ? data.u : undefined,
      email: String(data.e),
      name: String(data.n || (data.r === "admin" ? "Admin" : data.e)),
      role: data.r,
      picture: data.p ? String(data.p) : null,
    }
  } catch {
    return null
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_S,
  }
}
