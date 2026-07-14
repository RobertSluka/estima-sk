"use client"

import Link from "next/link"
import { ArrowRight, Calculator, Gauge, Landmark } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { REGIONS } from "@/lib/market"
import { formatEUR } from "@/lib/utils"

export default function LandingPage() {
  const { t } = useI18n()

  const features = [
    { icon: Gauge, title: t("landing.feat1Title"), body: t("landing.feat1Body") },
    { icon: Calculator, title: t("landing.feat2Title"), body: t("landing.feat2Body") },
    { icon: Landmark, title: t("landing.feat3Title"), body: t("landing.feat3Body") },
  ]

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      {/* Hero */}
      <div className="text-center">
        <h1 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-relaxed text-slate-500 sm:text-base">
          {t("landing.heroSubtitle")}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/odhad">
              {t("landing.ctaEstimate")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/kupa-alebo-prenajom">{t("landing.ctaBuyRent")}</Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardContent className="p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <f.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-slate-900">{f.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regional price levels */}
      <div className="mt-16">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              {REGIONS.map((r) => (
                <div key={r.id} className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs text-slate-500">{r.name}</span>
                  <span className="whitespace-nowrap text-sm font-semibold text-slate-900">
                    {formatEUR(r.pricePerM2)}/m²
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">{t("landing.statsNote")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
