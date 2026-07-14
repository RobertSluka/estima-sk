"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchAllListings, type Listing } from "@/lib/api"
import { getSavedIds, onSavedChange } from "@/lib/saved"
import { formatEUR, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

// The portfolio is built from saved (hearted) listings — no auth backend yet,
// so it is per-browser, same as the saved page.
export default function PortfolioPage() {
  const { t } = useI18n()
  const [all, setAll] = useState<Listing[]>([])
  const [ids, setIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIds(getSavedIds())
    const off = onSavedChange(() => setIds(getSavedIds()))
    fetchAllListings()
      .then((d) => setAll(d.items))
      .catch(() => setAll([]))
      .finally(() => setLoading(false))
    return off
  }, [])

  const holdings = useMemo(() => all.filter((l) => ids.includes(l.id)), [all, ids])

  const totals = useMemo(() => {
    const sale = holdings.filter((l) => l.dealType === "sale" && l.price != null)
    const value = sale.reduce((sum, l) => sum + (l.price as number), 0)
    const areas = holdings
      .map((l) => l.floorArea)
      .filter((v): v is number => v != null && v > 0)
    const area = areas.reduce((s, v) => s + v, 0)
    const ppsms = sale
      .map((l) => l.pricePerSqm)
      .filter((v): v is number => v != null && v > 0)
    const avgPpsm = ppsms.length
      ? ppsms.reduce((s, v) => s + v, 0) / ppsms.length
      : null
    const kraje = new Set(holdings.map((l) => l.region).filter(Boolean))
    return { count: holdings.length, value, area, avgPpsm, kraje: kraje.size }
  }, [holdings])

  const kpis = [
    { label: t("portfolio.kpiCount"), value: formatNumber(totals.count) },
    { label: t("portfolio.kpiValue"), value: formatEUR(totals.value) },
    { label: t("portfolio.kpiArea"), value: `${formatNumber(Math.round(totals.area))} m²` },
    {
      label: t("portfolio.kpiPpsm"),
      value: totals.avgPpsm != null ? `${formatEUR(Math.round(totals.avgPpsm))}/m²` : "—",
    },
    { label: t("portfolio.kpiKraje"), value: formatNumber(totals.kraje) },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t("portfolio.title")}</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">{t("portfolio.subtitle")}</p>

      {!loading && holdings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Briefcase className="h-6 w-6 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t("portfolio.empty")}</p>
            <Link
              href="/inzeraty"
              className="mt-3 inline-block text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              {t("saved.browse")}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-8">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white px-5 py-5 flex flex-col">
                <span className="text-xl font-bold text-slate-900 tabular-nums tracking-tight">
                  {k.value}
                </span>
                <span className="mt-1 text-[11px] leading-snug text-slate-400">
                  {k.label}
                </span>
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-widest text-slate-400">
                    <th className="px-5 py-3 font-semibold">{t("portfolio.colName")}</th>
                    <th className="px-5 py-3 font-semibold">{t("portfolio.colLocation")}</th>
                    <th className="px-5 py-3 font-semibold">{t("portfolio.colLayout")}</th>
                    <th className="px-5 py-3 font-semibold text-right">{t("portfolio.colArea")}</th>
                    <th className="px-5 py-3 font-semibold text-right">{t("portfolio.colPrice")}</th>
                    <th className="px-5 py-3 font-semibold text-right">€/m²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {holdings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 max-w-[280px]">
                        <a
                          href={l.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-900 hover:underline line-clamp-1"
                        >
                          {l.name ?? "—"}
                        </a>
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {l.locality ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{l.layout ?? "—"}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                        {l.floorArea != null ? `${formatNumber(l.floorArea)} m²` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-900">
                        {l.price != null
                          ? `${formatEUR(l.price)}${l.dealType === "rent" ? t("listings.perMonth") : ""}`
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                        {l.pricePerSqm != null ? formatEUR(Math.round(l.pricePerSqm)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
