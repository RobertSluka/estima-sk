import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"
import { getUser, updateSubscription } from "@/lib/backend"
import { appOrigin } from "@/lib/google"
import { proPriceId, stripe, stripeConfigured } from "@/lib/stripe"

// Starts a Stripe Checkout for the Pro subscription. Requires a signed-in
// database user (the env-var admin has no billing identity).
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "billing_not_configured" }, { status: 503 })
  }
  const user = verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }
  if (user.role !== "user" || !user.id) {
    return NextResponse.json({ error: "admin_has_no_billing" }, { status: 400 })
  }

  const backendUser = await getUser(user.id)
  if (backendUser.status !== 200 || !backendUser.data?.user) {
    return NextResponse.json({ error: "backend_unavailable" }, { status: 502 })
  }
  const u = backendUser.data.user
  if (u.plan === "pro") {
    return NextResponse.json({ error: "already_subscribed" }, { status: 409 })
  }

  try {
    // Reuse the Stripe customer across checkout attempts.
    let customerId = u.subscription?.stripe_customer_id ?? null
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: u.email,
        name: u.name ?? undefined,
        metadata: { estima_user_id: String(u.id) },
      })
      customerId = customer.id
      await updateSubscription({ user_id: u.id, stripe_customer_id: customerId })
    }

    const origin = appOrigin(request.url)
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: proPriceId(), quantity: 1 }],
      success_url: `${origin}/cennik?billing=success`,
      cancel_url: `${origin}/cennik?billing=canceled`,
      allow_promotion_codes: true,
      metadata: { estima_user_id: String(u.id) },
      subscription_data: { metadata: { estima_user_id: String(u.id) } },
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("stripe checkout failed", err)
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 })
  }
}
