"use client"

import { Check, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { pricingContent } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export default function CennikPage() {
  const { lang } = useI18n()
  const c = pricingContent[lang]

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {c.heading}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">{c.subheading}</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-start">
        {c.plans.map((plan) => {
          const featured = plan.highlighted
          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex h-full flex-col",
                featured && "border-slate-900 shadow-md md:-mt-2 ring-1 ring-slate-900",
              )}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  {c.mostPopular}
                </span>
              )}
              <CardContent className="flex flex-1 flex-col p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {plan.name}
                </h2>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="pb-1 text-sm font-medium text-slate-400">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-500">{plan.tagline}</p>

                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant={featured ? "default" : "outline"} className="mt-6 w-full">
                  <a href="mailto:hello@estima.sk">
                    {plan.id === "invest" ? c.ctaContact : c.ctaGetStarted}
                  </a>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">{c.billingNote}</p>

      {/* API tiers */}
      <div className="mt-14">
        <h2 className="text-center text-lg font-bold tracking-tight text-slate-900">
          {c.apiHeading}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          {c.apiSubheading}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {c.apiTiers.map((tier) => (
            <Card key={tier.name}>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {tier.name}
                </h3>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {tier.price}
                  </span>
                  <span className="pb-1 text-sm font-medium text-slate-400">{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{tier.included}</p>
                <p className="mt-1 text-xs text-slate-400">{tier.overage}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild>
            <a href="mailto:hello@estima.sk">{c.apiCta}</a>
          </Button>
          <p className="mt-3 text-xs text-slate-400">{c.apiNote}</p>
        </div>
      </div>
    </div>
  )
}
