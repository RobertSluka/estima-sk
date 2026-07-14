"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { formatEUR } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import type { ValueEstimate } from "@/lib/analyza"

const SIGNAL: Record<ValueEstimate["signal"], { variant: BadgeProps["variant"]; Icon: typeof Minus }> = {
  under: { variant: "underpriced", Icon: TrendingDown },
  fair: { variant: "fair", Icon: Minus },
  above: { variant: "overpriced", Icon: TrendingUp },
}

export default function ValueEstimateCard({ value }: { value: ValueEstimate }) {
  const { t } = useI18n()
  const { variant, Icon } = SIGNAL[value.signal]
  const diff = value.diffPercent
  const diffLabel = `${diff > 0 ? "+" : ""}${diff.toFixed(1)} %`

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">{t("analyses.value.title")}</h3>
          <Badge variant={variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {t(`analyses.value.signal.${value.signal}`)}
          </Badge>
        </div>

        <p className="text-[11px] uppercase tracking-wide text-slate-400">
          {t("analyses.value.estimated")}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {formatEUR(value.estimatedMin)} – {formatEUR(value.estimatedMax)}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] text-slate-400">{t("analyses.value.listingPrice")}</p>
            <p className="font-semibold text-slate-900">
              {value.listingPrice != null ? formatEUR(value.listingPrice) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400">{t("analyses.value.difference")}</p>
            <p
              className={`font-semibold ${
                value.signal === "above"
                  ? "text-red-600"
                  : value.signal === "under"
                    ? "text-blue-600"
                    : "text-emerald-600"
              }`}
            >
              {diffLabel}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
