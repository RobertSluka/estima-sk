import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"
import { getUser } from "@/lib/backend"
import { appOrigin } from "@/lib/google"
import { stripe, stripeConfigured } from "@/lib/stripe"

// Opens the Stripe customer portal (cancel, change card, invoices).
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "billing_not_configured" }, { status: 503 })
  }
  const user = verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
  if (!user || user.role !== "user" || !user.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  const backendUser = await getUser(user.id)
  const customerId = backendUser.data?.user?.subscription?.stripe_customer_id
  if (!customerId) {
    return NextResponse.json({ error: "no_billing_account" }, { status: 404 })
  }

  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appOrigin(request.url)}/cennik`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("stripe portal failed", err)
    return NextResponse.json({ error: "portal_failed" }, { status: 502 })
  }
}
