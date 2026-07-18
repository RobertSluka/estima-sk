"use client"

// /mapa-cien — the Slovak market at a glance. A full-height okres heat map
// with switchable layers (median €/m², supply, price drops, fresh listings)
// plus a ranking rail that re-orders okresy by the active layer's metric.
// Selecting an okres (map circle or rail row) swaps the rail for a drill-down
// list of that okres's listings, each linking to /inzeraty/{id}.
// All layers are computed client-side from /listings and /price-drops — the
// dataset is small enough to hold in memory (see lib/api.ts).

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, Home, Map as MapIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  fetchAllListings,
  fetchPriceDrops,
  type DealId,
  type Listing,
} from "@/lib/api"
import type { DistrictHeatRow } from "@/components/PriceHeatMap"
import { useI18n } from "@/lib/i18n"
import { cn, formatEUR, formatNumber } from "@/lib/utils"

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
    // A sale-district selection means nothing in the rent dataset (and vice
    // versa) — drop it rather than showing an empty drill-down.
    setSelected(null)
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

  // Drill-down: every listing in the selected okres (coords not required),
  // newest first so fresh supply surfaces on top.
  const selectedMembers = useMemo(() => {
    if (!selected) return []
    const ts = (l: Listing) =>
      l.firstSeenAt ? new Date(l.firstSeenAt).getTime() : 0
    return listings
      .filter((l) => l.district === selected)
      .sort((a, b) => ts(b) - ts(a))
  }, [listings, selected])

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

          {/* Okres ranking rail / listing drill-down */}
          <div className="w-full lg:w-[32%]">
            <Card className="lg:sticky lg:top-4">
              {selected ? (
                <CardContent className="p-0">
                  <div className="border-b border-slate-100 px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      {t("heat.backToRanking")}
                    </button>
                    <h2 className="mt-1 text-sm font-semibold text-slate-900">
                      {selected}
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        {formatNumber(selectedMembers.length)}
                      </span>
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {t("heat.panelHint")}
                    </p>
                  </div>
                  {selectedMembers.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-slate-400">
                      {t("heat.noListings")}
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-50 lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto">
                      {selectedMembers.map((l) => (
                        <li key={l.id}>
                          <Link
                            href={`/inzeraty/${encodeURIComponent(l.id)}`}
                            className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-slate-50"
                          >
                            <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-slate-100">
                              {l.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={l.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Home className="h-4 w-4 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-slate-700">
                                {l.name ?? t("listings.untitled")}
                              </p>
                              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                {[
                                  l.locality,
                                  l.layout,
                                  l.floorArea != null
                                    ? `${formatNumber(l.floorArea)} m²`
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-xs font-semibold tabular-nums text-slate-900">
                                {l.price != null
                                  ? formatEUR(l.price)
                                  : t("listings.priceNa")}
                                {l.price != null && l.dealType === "rent" && (
                                  <span className="font-normal text-slate-400">
                                    {t("listings.perMonth")}
                                  </span>
                                )}
                              </p>
                              {l.pricePerSqm != null && (
                                <p className="text-[10px] tabular-nums text-slate-400">
                                  {formatEUR(l.pricePerSqm)}/m²
                                </p>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              ) : (
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
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
