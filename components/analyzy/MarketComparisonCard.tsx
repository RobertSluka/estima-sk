"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { NBS_LATEST_PERIOD } from "@/lib/nbs"

// SK counterpart of the CZ analyses Market-comparison card. Every row is real
// data: medians computed from live listings, the external index straight from
// the embedded NBS series (lib/nbs.ts) — never a synthesized number.
export interface MarketComparison {
  districtMedianPerSqm: number | null
  similarMedianPerSqm: number | null
  /** NBS regional realized price, EUR/m² — null for rent listings (sale-only index). */
  nbsPerSqm: number | null
  nbsLabel: string | null
  selectedPerSqm: number | null
  diffPercentVsMarket: number | null // selected vs. district median
}

function Bar({ value, max, highlight }: { value: number; max: number; highlight?: boolean }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${highlight ? "bg-emerald-500" : "bg-slate-300"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function MarketComparisonCard({ market }: { market: MarketComparison }) {
  const { t } = useI18n()
  const rows = [
    { label: t("analyses.market.district"), value: market.districtMedianPerSqm },
    { label: t("analyses.market.similar"), value: market.similarMedianPerSqm },
    ...(market.nbsPerSqm != null
      ? [{ label: market.nbsLabel ?? "NBS", value: market.nbsPerSqm, muted: true }]
      : []),
    { label: t("analyses.market.selected"), value: market.selectedPerSqm, highlight: true },
  ]
  const max = Math.max(...rows.map((r) => r.value ?? 0))
  const diff = market.diffPercentVsMarket

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">{t("analyses.market.title")}</h3>
          {diff != null && (
            <span
              className={`text-xs font-semibold ${
                diff > 0 ? "text-red-600" : diff < 0 ? "text-blue-600" : "text-slate-500"
              }`}
            >
              {diff > 0 ? "+" : ""}
              {diff.toFixed(1)} % {t("analyses.market.vsMarket")}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={r.highlight ? "font-semibold text-slate-900" : "text-slate-500"}>
                  {r.label}
                </span>
                <span
                  className={`tabular-nums ${
                    r.muted ? "text-slate-400" : "text-slate-700 font-medium"
                  }`}
                >
                  {r.value != null ? `${formatNumber(Math.round(r.value))} €/m²` : "—"}
                </span>
              </div>
              <Bar value={r.value ?? 0} max={max} highlight={r.highlight} />
            </div>
          ))}
        </div>

        {market.nbsPerSqm != null && (
          <p className="mt-3 text-[10px] leading-snug text-slate-400">
            {t("analyses.market.nbsNote", { period: NBS_LATEST_PERIOD })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
