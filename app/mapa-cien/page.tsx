"use client"

// /mapa-cien — the Slovak market at a glance. A full-height okres heat map
// with switchable layers (median €/m², supply, price drops, fresh listings)
// plus a ranking rail that re-orders okresy by the active layer's metric.
// All layers are computed client-side from /listings and /price-drops — the
// dataset is small enough to hold in memory (see lib/api.ts).

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Map as MapIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  fetchAllListings,
  fetchPriceDrops,
  type DealId,
  type Listing,
} from "@/lib/api"
import type { DistrictHeatRow } from "@/components/PriceHeatMap"
import { useI18n } from "@/lib/i18n"
import { cn, formatNumber } from "@/lib/utils"

const PriceHeatMap = dynamic(() => import("@/components/PriceHeatMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
  ),
})

type LayerId = "ppsm" | "supply" | "drops" | "new"

const LAYERS: LayerId[] = ["ppsm", "supply", "drops", "new"]

const NEW_DAYS = 7

function median(nums: number[]): number | null {
  if (nums.length === 0) return null
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

// One okres's stat under the active layer — the number the map colours and
// the rail ranks by.
function districtStat(
  members: Listing[],
  droppedIds: Set<string>,
  layer: LayerId,
): { value: number | null; display: string } {
  switch (layer) {
    case "ppsm": {
      const v = median(
        members.map((m) => m.pricePerSqm).filter((x): x is number => x != null),
      )
      return {
        value: v,
        display: v != null ? `${formatNumber(Math.round(v))} €/m²` : "—",
      }
    }
    case "drops": {
      const dropped = members.filter((m) => droppedIds.has(m.id)).length
      const v = members.length > 0 ? (dropped / members.length) * 100 : null
      return { value: v, display: v != null ? `${Math.round(v)}%` : "—" }
    }
    case "new": {
      const now = Date.now()
      const v = members.filter((m) => {
        if (!m.firstSeenAt) return false
        return now - new Date(m.firstSeenAt).getTime() <= NEW_DAYS * 86_400_000
      }).length
      return { value: v, display: formatNumber(v) }
    }
    // "supply" ranks by listing count.
    default:
      return { value: members.length, display: formatNumber(members.length) }
  }
}

export default function PriceMapPage() {
  const { t } = useI18n()

  const [listings, setListings] = useState<Listing[]>([])
  const [droppedIds, setDroppedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dealType, setDealType] = useState<DealId>("sale")
  const [layer, setLayer] = useState<LayerId>("ppsm")
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    // Price drops enrich the "drops" layer but must not sink the page.
    Promise.all([
      fetchAllListings({ dealType }),
      fetchPriceDrops({ dealType, sinceDays: 30, limit: 500 }).catch(() => null),
    ])
      .then(([all, drops]) => {
        if (!alive) return
        setListings(all.items)
        setDroppedIds(new Set((drops?.items ?? []).map((d) => d.propertyId)))
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [dealType])

  // Okres aggregation: centroid of member listings, stat per active layer.
  const rows = useMemo<DistrictHeatRow[]>(() => {
    const byDistrict = new Map<string, Listing[]>()
    for (const l of listings) {
      if (!l.district || l.lat == null || l.lon == null) continue
      const arr = byDistrict.get(l.district)
      if (arr) arr.push(l)
      else byDistrict.set(l.district, [l])
    }
    const out = Array.from(byDistrict, ([district, members]) => {
      const pts = members.filter((m) => m.lat != null && m.lon != null)
      return {
        district,
        region: members[0].region,
        count: members.length,
        lat: pts.reduce((s, m) => s + m.lat!, 0) / pts.length,
        lon: pts.reduce((s, m) => s + m.lon!, 0) / pts.length,
        ...districtStat(members, droppedIds, layer),
      }
    })
    out.sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity))
    return out
  }, [listings, droppedIds, layer])

  const maxValue = useMemo(
    () => Math.max(1e-9, ...rows.map((r) => r.value ?? 0)),
    [rows],
  )

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-900">
          <MapIcon className="h-5 w-5 text-slate-400" />
          <h1 className="text-xl font-bold tracking-tight">{t("heat.title")}</h1>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{t("heat.subtitle")}</p>
      </div>

      {/* Sale / Rent + layer switcher */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {(["sale", "rent"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDealType(d)}
              aria-pressed={d === dealType}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                d === dealType
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {t(d === "sale" ? "listings.dealSale" : "listings.dealRent")}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {LAYERS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLayer(l)}
              aria-pressed={l === layer}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                l === layer
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {t(`heat.layer.${l}`)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-red-800">
              {t("listings.backendError")}
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {/* Heat map */}
          <div className="relative h-[70vh] min-h-[460px] w-full lg:h-[calc(100vh-12rem)] lg:w-[68%]">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            ) : (
              <PriceHeatMap rows={rows} selected={selected} onSelect={setSelected} />
            )}
          </div>

          {/* Okres ranking rail */}
          <div className="w-full lg:w-[32%]">
            <Card className="lg:sticky lg:top-4">
              <CardContent className="p-0">
                <div className="border-b border-slate-100 px-5 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t("heat.districts")}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {t(`heat.layer.${layer}`)}
                    </span>
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {t("heat.districtsHint")}
                  </p>
                </div>
                {loading ? (
                  <div className="space-y-2 p-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-6 animate-pulse rounded bg-slate-100" />
                    ))}
                  </div>
                ) : rows.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-slate-400">
                    {t("heat.noDistricts")}
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {rows.map((r) => (
                      <li key={r.district}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelected(selected === r.district ? null : r.district)
                          }
                          className={cn(
                            "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-slate-50",
                            selected === r.district && "bg-slate-50",
                          )}
                        >
                          <span className="w-24 shrink-0 truncate text-xs font-medium text-slate-700">
                            {r.district}
                          </span>
                          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-slate-900"
                              style={{
                                width: `${((r.value ?? 0) / maxValue) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="w-20 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-900">
                            {r.display}
                          </span>
                          <span className="w-10 shrink-0 text-right text-[10px] text-slate-400">
                            {formatNumber(r.count)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
