import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { authConfigured } from "@/lib/auth"
import { accountsConfigured } from "@/lib/backend"
import { OAUTH_STATE_COOKIE, appOrigin, buildAuthUrl, googleConfigured } from "@/lib/google"

// Starts the Google sign-in: sets a CSRF state cookie and redirects to Google.
export async function GET(request: Request) {
  const origin = appOrigin(request.url)
  if (!googleConfigured() || !accountsConfigured() || !authConfigured()) {
    return NextResponse.redirect(`${origin}/prihlasenie?error=google`)
  }

  const url = new URL(request.url)
  const next = url.searchParams.get("next") || "/inzeraty"
  // Only allow internal redirect targets.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/inzeraty"

  const state = randomBytes(16).toString("base64url")
  const res = NextResponse.redirect(buildAuthUrl(origin, state))
  res.cookies.set(OAUTH_STATE_COOKIE, JSON.stringify({ state, next: safeNext }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  })
  return res
}
