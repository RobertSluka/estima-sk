"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Star, Home } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchAllListings, categoryBucket, type Listing } from "@/lib/api"
import { formatEUR, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import OpportunitiesChart from "@/components/OpportunitiesChart"

// Minimum comparables in the same (okres, category) group for a meaningful
// median; below this the discount is noise, not an opportunity.
const MIN_COMPARABLES = 4

interface Opportunity {
  listing: Listing
  groupMedian: number
  discount: number // negative % vs group median
  comparables: number
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

export default function OpportunitiesPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  // Region (kraj) filter — owned here so the chart chips and the list below
  // stay in sync.
  const [region, setRegion] = useState<string | null>(null)

  useEffect(() => {
    fetchAllListings({ dealType: "sale" })
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const opportunities = useMemo<Opportunity[]>(() => {
    // group by (okres, category bucket)
    const groups = new Map<string, Listing[]>()
    for (const l of items) {
      if (!l.district || l.pricePerSqm == null || l.pricePerSqm <= 0) continue
      const key = `${l.district}|${categoryBucket(l.category)}`
      const arr = groups.get(key) ?? []
      arr.push(l)
      groups.set(key, arr)
    }
    const out: Opportunity[] = []
    for (const group of Array.from(groups.values())) {
      if (group.length < MIN_COMPARABLES) continue
      const med = median(group.map((l) => l.pricePerSqm as number))
      for (const l of group) {
        const discount = ((l.pricePerSqm as number) - med) / med
        if (discount < -0.1) {
          out.push({
            listing: l,
            groupMedian: med,
            discount: discount * 100,
            comparables: group.length,
          })
        }
      }
    }
    return out.sort((a, b) => a.discount - b.discount)
  }, [items])

  const visible = useMemo(
    () => opportunities.filter((o) => !region || o.listing.region === region),
    [opportunities, region],
  )

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t("opps.title")}</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        {loading
          ? t("common.loading")
          : t("opps.subtitle", { n: formatNumber(visible.length) })}
      </p>

      {!loading && <OpportunitiesChart opportunities={opportunities} region={region} onRegionChange={setRegion} />}

      {!loading && visible.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Star className="h-6 w-6 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t("opps.empty")}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {visible.map((o) => (
          <Link
            key={o.listing.id}
            href={`/inzeraty/${encodeURIComponent(o.listing.id)}`}
            className="block"
          >
            <Card className="hover:border-slate-300 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                {o.listing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={o.listing.imageUrl}
                    alt=""
                    className="h-16 w-20 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-16 w-20 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Home className="h-5 w-5 text-slate-300" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {o.listing.name ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {[
                      o.listing.locality,
                      o.listing.layout,
                      o.listing.floorArea ? `${formatNumber(o.listing.floorArea)} m²` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t("opps.median")}: {formatEUR(Math.round(o.groupMedian))}/m² ·{" "}
                    {t("opps.comparables", { n: o.comparables })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">
                    {o.listing.price != null ? formatEUR(o.listing.price) : "—"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {o.listing.pricePerSqm != null
                      ? `${formatEUR(Math.round(o.listing.pricePerSqm))}/m²`
                      : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 tabular-nums">
                  {o.discount.toFixed(0)} %
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-[11px] text-slate-400 max-w-2xl">{t("opps.disclaimer")}</p>
    </div>
  )
}
