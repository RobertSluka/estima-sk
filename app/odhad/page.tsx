"use client"

import { useI18n } from "@/lib/i18n"
import EstimateForm from "@/components/EstimateForm"

export default function OdhadPage() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-10 text-center">
        <h1 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("estimate.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          {t("estimate.subtitle")}
        </p>
      </div>
      <EstimateForm />
    </div>
  )
}
