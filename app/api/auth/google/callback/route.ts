import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth"
import { googleSignIn } from "@/lib/backend"
import { OAUTH_STATE_COOKIE, appOrigin, exchangeCode } from "@/lib/google"

// Google redirects back here with ?code&state. Verify state, exchange the
// code, upsert the user in the backend, mint our session cookie.
export async function GET(request: Request) {
  const origin = appOrigin(request.url)
  const fail = () => {
    const res = NextResponse.redirect(`${origin}/prihlasenie?error=google`)
    res.cookies.delete(OAUTH_STATE_COOKIE)
    return res
  }

  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  if (!code || !state) return fail()

  let saved: { state?: string; next?: string } = {}
  try {
    saved = JSON.parse(cookies().get(OAUTH_STATE_COOKIE)?.value ?? "{}")
  } catch {
    return fail()
  }
  if (!saved.state || saved.state !== state) return fail()

  const claims = await exchangeCode(origin, code)
  if (!claims) return fail()

  const backendRes = await googleSignIn(claims)
  if (backendRes.status !== 200 || !backendRes.data?.user) return fail()

  const u = backendRes.data.user
  const token = createSessionToken({
    id: u.id,
    email: u.email,
    name: u.name ?? u.email,
    role: "user",
    picture: u.picture_url,
  })
  if (!token) return fail()

  const next = saved.next?.startsWith("/") && !saved.next.startsWith("//") ? saved.next : "/inzeraty"
  const res = NextResponse.redirect(`${origin}${next}`)
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  res.cookies.delete(OAUTH_STATE_COOKIE)
  return res
}
