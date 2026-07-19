import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"
import { getUser } from "@/lib/backend"

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value
  const user = verifySessionToken(token)
  if (!user) {
    return NextResponse.json({ authenticated: false })
  }

  // Database users: re-fetch profile + plan so subscription changes (webhooks,
  // portal cancellations) show up without re-login. Backend down → fall back
  // to token claims with the free plan rather than signing the user out.
  if (user.role === "user" && user.id) {
    const res = await getUser(user.id)
    if (res.status === 404) {
      // Account deleted server-side — invalidate the session.
      const out = NextResponse.json({ authenticated: false })
      out.cookies.delete(SESSION_COOKIE)
      return out
    }
    if (res.status === 200 && res.data?.user) {
      const u = res.data.user
      // Role comes from the backend so an admin-granted promotion (or a
      // demotion) takes effect on the next request without re-login.
      return NextResponse.json({
        authenticated: true,
        user: {
          id: u.id,
          email: u.email,
          name: u.name ?? u.email,
          role: u.role === "admin" ? "admin" : "user",
          picture: u.picture_url,
          plan: u.plan,
          subscription: u.subscription,
          has_google: u.has_google,
          has_password: u.has_password,
        },
      })
    }
    return NextResponse.json({ authenticated: true, user: { ...user, plan: "basic" } })
  }

  // Admin sees everything.
  return NextResponse.json({ authenticated: true, user: { ...user, plan: "pro" } })
}
