"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { fetchAllListings, categoryBucket, type Listing } from "@/lib/api"
import { formatEUR, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

function median(nums: number[]): number | null {
  if (nums.length === 0) return null
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

export default function DashboardPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllListings()
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const sale = items.filter((l) => l.dealType === "sale")
    const rent = items.filter((l) => l.dealType === "rent")
    const salePpsm = sale
      .map((l) => l.pricePerSqm)
      .filter((v): v is number => v != null && v > 0)
    const towns = new Set(items.map((l) => l.locality).filter(Boolean))

    // median sale €/m² per kraj (apartments dominate; use all sale listings)
    const byKraj = new Map<string, number[]>()
    for (const l of sale) {
      if (!l.region || l.pricePerSqm == null || l.pricePerSqm <= 0) continue
      const arr = byKraj.get(l.region) ?? []
      arr.push(l.pricePerSqm)
      byKraj.set(l.region, arr)
    }
    const krajRows = Array.from(byKraj.entries())
      .map(([kraj, vals]) => ({
        kraj,
        median: Math.round(median(vals) ?? 0),
        count: vals.length,
      }))
      .sort((a, b) => b.median - a.median)

    const catCounts = new Map<string, number>()
    for (const l of items) {
      const b = categoryBucket(l.category)
      catCounts.set(b, (catCounts.get(b) ?? 0) + 1)
    }

    return {
      total: items.length,
      saleCount: sale.length,
      rentCount: rent.length,
      medianPpsm: median(salePpsm),
      towns: towns.size,
      krajRows,
      catCounts,
    }
  }, [items])

  const kpis = [
    { label: t("dash.kpiTotal"), value: formatNumber(stats.total) },
    { label: t("dash.kpiSale"), value: formatNumber(stats.saleCount) },
    { label: t("dash.kpiRent"), value: formatNumber(stats.rentCount) },
    {
      label: t("dash.kpiPpsm"),
      value: stats.medianPpsm != null ? `${formatEUR(stats.medianPpsm)}/m²` : "—",
    },
    { label: t("dash.kpiTowns"), value: formatNumber(stats.towns) },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t("dash.title")}</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        {loading ? t("common.loading") : t("dash.subtitle")}
      </p>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white px-5 py-5 flex flex-col">
            <span className="text-xl font-bold text-slate-900 tabular-nums tracking-tight">
              {k.value}
            </span>
            <span className="mt-1 text-[11px] leading-snug text-slate-400">{k.label}</span>
          </div>
        ))}
      </div>

      {/* Median €/m² by kraj */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">{t("dash.krajTitle")}</h2>
          <p className="text-xs text-slate-400 mb-5">{t("dash.krajSub")}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.krajRows} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="kraj"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `${formatNumber(v)} €`}
                  width={70}
                />
                <Tooltip
                  formatter={(v: number) => [`${formatNumber(v)} €/m²`, t("dash.tooltipMedian")]}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="median" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category split */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">{t("dash.catTitle")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(["apartments", "houses", "land", "commercial", "other"] as const).map((c) => (
              <div key={c} className="border border-slate-200 rounded-lg px-4 py-3">
                <p className="text-lg font-bold text-slate-900 tabular-nums">
                  {formatNumber(stats.catCounts.get(c) ?? 0)}
                </p>
                <p className="text-[11px] text-slate-400">{t(`dash.cat.${c}`)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
