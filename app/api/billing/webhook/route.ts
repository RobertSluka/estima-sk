import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { updateSubscription } from "@/lib/backend"
import { stripe, stripeConfigured, subscriptionPeriodEnd } from "@/lib/stripe"

// Stripe webhook — the single writer of subscription state. Configure the
// endpoint in the Stripe dashboard with events:
//   checkout.session.completed
//   customer.subscription.updated
//   customer.subscription.deleted
// and put its signing secret in STRIPE_WEBHOOK_SECRET.

async function applySubscription(sub: Stripe.Subscription, userId?: number) {
  await updateSubscription({
    user_id: userId,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    plan: "pro",
    status: sub.status,
    current_period_end: subscriptionPeriodEnd(sub),
    cancel_at_period_end: sub.cancel_at_period_end,
  })
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeConfigured() || !secret) {
    return NextResponse.json({ error: "billing_not_configured" }, { status: 503 })
  }

  const payload = await request.text()
  const signature = request.headers.get("stripe-signature") ?? ""
  let event: Stripe.Event
  try {
    event = await stripe().webhooks.constructEventAsync(payload, signature, secret)
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id
          const sub = await stripe().subscriptions.retrieve(subId)
          const userId = Number(session.metadata?.estima_user_id) || undefined
          await applySubscription(sub, userId)
        }
        break
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const userId = Number(sub.metadata?.estima_user_id) || undefined
        await applySubscription(sub, userId)
        break
      }
      default:
        break
    }
  } catch (err) {
    // Return 500 so Stripe retries — subscription state must not be dropped.
    console.error("webhook handling failed", event.type, err)
    return NextResponse.json({ error: "webhook_failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
