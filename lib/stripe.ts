// Stripe server-side helpers (server-only — secret key lives here).
//
//   STRIPE_SECRET_KEY      sk_live_… / sk_test_…
//   STRIPE_PRICE_PRO       the recurring Price id for the Pro plan (9,90 €/m)
//   STRIPE_WEBHOOK_SECRET  signing secret of the /api/billing/webhook endpoint
//
// Stripe is the billing source of truth; the backend's subscriptions table
// only caches what webhooks report (see app/api/billing/webhook/route.ts).

import Stripe from "stripe"

let client: Stripe | null = null

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO)
}

export function stripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY!)
  return client
}

export function proPriceId(): string {
  return process.env.STRIPE_PRICE_PRO!
}

/**
 * Period end in unix seconds, tolerant of Stripe API-version differences:
 * newer versions moved current_period_end from the subscription to its items.
 */
export function subscriptionPeriodEnd(sub: Stripe.Subscription): number | undefined {
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined
  const top = (sub as unknown as { current_period_end?: number }).current_period_end
  return item?.current_period_end ?? top ?? undefined
}
