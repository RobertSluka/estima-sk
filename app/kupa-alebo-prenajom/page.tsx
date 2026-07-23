"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { HORIZON_YEARS } from "@/lib/buyVsRent"
import BuyVsRentCalculator from "@/components/BuyVsRentCalculator"

export default function KupaAleboPrenajomPage() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-10 text-center">
        <h1 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("buyRent.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          {t("buyRent.subtitle", { years: HORIZON_YEARS })}
        </p>
      </div>

      <BuyVsRentCalculator />

      {/* Cross-promo to the estimate */}
      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500">{t("buyRent.cta")}</p>
        <Button asChild className="mt-3">
          <Link href="/odhad">
            {t("buyRent.ctaButton")}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
