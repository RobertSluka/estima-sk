"use client"

import { X, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatEUR, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import type { ComparableRow } from "@/lib/analyza"

// SK has no listing-detail route, so rows link out to the source portal
// (Bazoš) in a new tab instead of navigating in-app like the CZ version.
export default function ComparableListingsTable({
  rows,
  onRemove,
}: {
  rows: ComparableRow[]
  onRemove?: (id: string) => void
}) {
  const { t } = useI18n()

  const open = (r: ComparableRow) => {
    if (r.url) window.open(r.url, "_blank", "noopener,noreferrer")
  }

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">{t("analyses.comps.title")}</h3>

        {rows.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-400">
            {t("analyses.comps.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="font-medium py-2 pr-3">{t("analyses.comps.address")}</th>
                  <th className="font-medium py-2 pr-3">{t("analyses.comps.layout")}</th>
                  <th className="font-medium py-2 pr-3 text-right">{t("analyses.comps.area")}</th>
                  <th className="font-medium py-2 pr-3 text-right">{t("analyses.comps.price")}</th>
                  <th className="font-medium py-2 pr-3 text-right">€/m²</th>
                  <th className="font-medium py-2 pr-3 text-right">{t("analyses.comps.diff")}</th>
                  {onRemove && <th className="w-6 py-2" />}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => open(r)}
                    className={`group border-b border-slate-50 last:border-0 hover:bg-slate-50 ${
                      r.url ? "cursor-pointer" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-medium text-slate-800 max-w-[260px]">
                      <span className="flex items-center gap-1 group-hover:text-emerald-700">
                        <span className="truncate">{r.address}</span>
                        {r.url && (
                          <ExternalLink className="h-3 w-3 shrink-0 text-slate-300 group-hover:text-emerald-600" />
                        )}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-slate-500">{r.layout}</td>
                    <td className="py-2 pr-3 text-right text-slate-600 tabular-nums">
                      {formatNumber(r.area)} m²
                    </td>
                    <td className="py-2 pr-3 text-right text-slate-700 tabular-nums whitespace-nowrap">
                      {formatEUR(r.price)}
                    </td>
                    <td className="py-2 pr-3 text-right text-slate-600 tabular-nums whitespace-nowrap">
                      {formatNumber(Math.round(r.pricePerSqm))}
                    </td>
                    <td
                      className={`py-2 pr-3 text-right tabular-nums font-medium ${
                        r.diffPercent > 0 ? "text-red-600" : r.diffPercent < 0 ? "text-blue-600" : "text-slate-500"
                      }`}
                    >
                      {r.diffPercent > 0 ? "+" : ""}
                      {r.diffPercent.toFixed(1)} %
                    </td>
                    {onRemove && (
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          aria-label={t("analyses.comps.remove")}
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(r.id)
                          }}
                          className="rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
