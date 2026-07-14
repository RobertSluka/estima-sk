"use client"

import { Card, CardContent } from "@/components/ui/card"
import MarketInsights from "@/components/MarketInsights"
import { useI18n } from "@/lib/i18n"

export default function MarketPage() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-8 text-center">
        <h1 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("market.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          {t("market.subtitle")}
        </p>
      </div>

      <MarketInsights />

      <div className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-900">
              {t("market.methodTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {t("market.methodBody")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
