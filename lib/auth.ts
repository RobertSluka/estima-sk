// Server-side auth core — the single admin account.
//
// There is no user database yet: one admin account is configured through
// environment variables and sessions are stateless HMAC-signed cookies, so
// no new dependencies and nothing persists server-side.
//
//   ADMIN_EMAIL     login e-mail (default admin@estima.sk)
//   ADMIN_PASSWORD  login password — REQUIRED; login is disabled while unset,
//                   so a fresh deploy can never be entered with a known default
//   AUTH_SECRET     cookie-signing key; falls back to a key derived from
//                   ADMIN_PASSWORD so sessions survive restarts without
//                   extra configuration
//
// Server-only module: never import from client components.

import { createHmac, timingSafeEqual } from "crypto"

export const SESSION_COOKIE = "estima_session"
const SESSION_TTL_S = 7 * 24 * 60 * 60 // 7 days

export interface SessionUser {
  email: string
  name: string
  role: "admin"
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

/** True when the admin account is usable (password configured). */
export function authConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

/** Check the submitted credentials against the configured admin account. */
export function verifyCredentials(email: string, password: string): SessionUser | null {
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
    JSON.stringify({ e: user.email, r: user.role, x: Math.floor(Date.now() / 1000) + SESSION_TTL_S }),
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
    if (data.r !== "admin") return null
    return { email: String(data.e), name: "Admin", role: "admin" }
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
