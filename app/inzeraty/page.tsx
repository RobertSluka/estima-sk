"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import {
  Home,
  Map as MapIcon,
  RefreshCw,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ListingCard from "@/components/ListingCard"
import type { MapBounds } from "@/components/ListingsMap"
import { fetchAllListings, layoutRank, type Listing, type DealId } from "@/lib/api"
import { formatNumber, cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

// Leaflet touches `window` at module load — client-only.
const ListingsMap = dynamic(() => import("@/components/ListingsMap"), {
  ssr: false,
})

const PAGE_SIZE = 24

type SortKey =
  | "newest"
  | "priceAsc"
  | "priceDesc"
  | "ppsmAsc"
  | "ppsmDesc"
  | "areaDesc"

const sortOptions: { id: SortKey; labelKey: string }[] = [
  { id: "newest", labelKey: "sort.newest" },
  { id: "priceAsc", labelKey: "sort.priceAsc" },
  { id: "priceDesc", labelKey: "sort.priceDesc" },
  { id: "ppsmAsc", labelKey: "sort.ppsmAsc" },
  { id: "ppsmDesc", labelKey: "sort.ppsmDesc" },
  { id: "areaDesc", labelKey: "sort.areaDesc" },
]

const initialFilters = {
  q: "",
  deal: "all" as DealId | "all",
  layouts: [] as string[],
  region: "all",
  priceMin: "",
  priceMax: "",
  areaMin: "",
  areaMax: "",
  sort: "newest" as SortKey,
}

export default function ListingsPage() {
  const { t } = useI18n()
  const [all, setAll] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(0)

  // Map state
  const [showMap, setShowMap] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchInView, setSearchInView] = useState(false)
  const [bounds, setBounds] = useState<MapBounds | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllListings()
      setAll(data.items)
      setTotal(data.total)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load listings from the backend.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Facet values discovered from the loaded data.
  const layoutFacets = useMemo(() => {
    const s = new Set<string>()
    all.forEach((l) => l.layout && s.add(l.layout))
    return Array.from(s).sort(
      (a, b) => layoutRank(a) - layoutRank(b) || a.localeCompare(b),
    )
  }, [all])

  const regionFacets = useMemo(() => {
    const s = new Set<string>()
    all.forEach((l) => l.region && s.add(l.region))
    return Array.from(s).sort((a, b) => a.localeCompare(b, "sk"))
  }, [all])

  // Apply filters + sort (map pins follow this same set).
  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const pMin = filters.priceMin ? Number(filters.priceMin) : null
    const pMax = filters.priceMax ? Number(filters.priceMax) : null
    const aMin = filters.areaMin ? Number(filters.areaMin) : null
    const aMax = filters.areaMax ? Number(filters.areaMax) : null

    const out = all.filter((l) => {
      if (q) {
        const hay = `${l.name ?? ""} ${l.locality ?? ""}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.deal !== "all" && l.dealType !== filters.deal) return false
      if (filters.layouts.length && (!l.layout || !filters.layouts.includes(l.layout)))
        return false
      if (filters.region !== "all" && l.region !== filters.region) return false
      if (pMin != null && (l.price == null || l.price < pMin)) return false
      if (pMax != null && (l.price == null || l.price > pMax)) return false
      if (aMin != null && (l.floorArea == null || l.floorArea < aMin)) return false
      if (aMax != null && (l.floorArea == null || l.floorArea > aMax)) return false
      return true
    })

    const nz = (v: number | null, fallback: number) => (v == null ? fallback : v)
    switch (filters.sort) {
      case "priceAsc":
        out.sort((a, b) => nz(a.price, Infinity) - nz(b.price, Infinity))
        break
      case "priceDesc":
        out.sort((a, b) => nz(b.price, -Infinity) - nz(a.price, -Infinity))
        break
      case "ppsmAsc":
        out.sort((a, b) => nz(a.pricePerSqm, Infinity) - nz(b.pricePerSqm, Infinity))
        break
      case "ppsmDesc":
        out.sort((a, b) => nz(b.pricePerSqm, -Infinity) - nz(a.pricePerSqm, -Infinity))
        break
      case "areaDesc":
        out.sort((a, b) => nz(b.floorArea, -Infinity) - nz(a.floorArea, -Infinity))
        break
      case "newest":
      default:
        out.sort((a, b) => (b.firstSeenAt ?? "").localeCompare(a.firstSeenAt ?? ""))
        break
    }
    return out
  }, [all, filters])

  // The list additionally narrows to the map viewport when "search as I move
  // the map" is on; the map itself always shows the full filtered set.
  const visibleList = useMemo(() => {
    if (!showMap || !searchInView || !bounds) return filtered
    return filtered.filter(
      (l) =>
        l.lat != null &&
        l.lon != null &&
        l.lat <= bounds.north &&
        l.lat >= bounds.south &&
        l.lon <= bounds.east &&
        l.lon >= bounds.west,
    )
  }, [filtered, showMap, searchInView, bounds])

  // Reset to first page whenever the visible result set changes.
  useEffect(() => {
    setPage(0)
  }, [filters, searchInView, bounds])

  const pages = Math.max(1, Math.ceil(visibleList.length / PAGE_SIZE))
  const visible = visibleList.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const set = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) =>
    setFilters((f) => ({ ...f, [key]: value }))

  const toggleLayout = (l: string) =>
    setFilters((f) => ({
      ...f,
      layouts: f.layouts.includes(l)
        ? f.layouts.filter((x) => x !== l)
        : [...f.layouts, l],
    }))

  const activeCount =
    (filters.q ? 1 : 0) +
    (filters.deal !== "all" ? 1 : 0) +
    filters.layouts.length +
    (filters.region !== "all" ? 1 : 0) +
    (filters.priceMin || filters.priceMax ? 1 : 0) +
    (filters.areaMin || filters.areaMax ? 1 : 0)

  const resetFilters = () => setFilters(initialFilters)

  return (
    // Fills the viewport below the 3rem navbar; the list column scrolls
    // internally so the map stays put.
    <div className="flex h-[calc(100vh-3rem)] min-h-0">
      {/* ── Left: filters + list (scrolls) ──────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("listings.title")}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {loading
                  ? t("common.loading")
                  : activeCount > 0 || (searchInView && showMap)
                  ? t("listings.matchCount", {
                      n: formatNumber(visibleList.length),
                      total: formatNumber(total),
                    })
                  : t("listings.fromDb", { n: formatNumber(total) })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!showMap && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowMap(true)}
                >
                  <MapIcon className="h-4 w-4" />
                  {t("map.show")}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => load()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {t("listings.refresh")}
              </Button>
            </div>
          </div>

          {/* ── Filter bar ────────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 divide-y divide-slate-100">
            {/* Row 1: deal-type toggle + search + sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
              <div className="flex items-center rounded-md border border-slate-200 overflow-hidden shrink-0">
                {(["all", "sale", "rent"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => set("deal", d)}
                    className={cn(
                      "text-xs font-medium px-3 py-2 transition-colors",
                      filters.deal === d
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    {d === "all"
                      ? t("listings.dealAll")
                      : d === "sale"
                      ? t("listings.dealSale")
                      : t("listings.dealRent")}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => set("q", e.target.value)}
                  placeholder={t("listings.searchPlaceholder")}
                  className="w-full text-xs border border-slate-200 rounded-md py-2 pl-9 pr-8 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                {filters.q && (
                  <button
                    onClick={() => set("q", "")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={filters.sort}
                  onChange={(e) => set("sort", e.target.value as SortKey)}
                  className="text-xs border border-slate-200 rounded-md py-2 px-2.5 text-slate-700 bg-white"
                >
                  {sortOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: layout chips */}
            {layoutFacets.length > 0 && (
              <div className="p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {t("listings.layout")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {layoutFacets.map((l) => (
                    <button
                      key={l}
                      onClick={() => toggleLayout(l)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-medium border transition-colors",
                        filters.layouts.includes(l)
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Row 3: price + area + region */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {t("listings.price")}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => set("priceMin", e.target.value)}
                    placeholder={t("common.from")}
                    className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 text-slate-700 placeholder:text-slate-300"
                  />
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => set("priceMax", e.target.value)}
                    placeholder={t("common.to")}
                    className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 text-slate-700 placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {t("listings.area")}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.areaMin}
                    onChange={(e) => set("areaMin", e.target.value)}
                    placeholder={t("common.from")}
                    className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 text-slate-700 placeholder:text-slate-300"
                  />
                  <input
                    type="number"
                    value={filters.areaMax}
                    onChange={(e) => set("areaMax", e.target.value)}
                    placeholder={t("common.to")}
                    className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 text-slate-700 placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {t("listings.region")}
                </p>
                <select
                  value={filters.region}
                  onChange={(e) => set("region", e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-md py-1.5 px-2.5 text-slate-700 bg-white"
                >
                  <option value="all">{t("listings.allRegions")}</option>
                  {regionFacets.map((r) => (
                    <option key={r} value={r}>
                      {r} kraj
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4: active filter summary + reset */}
            {activeCount > 0 && (
              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50/60">
                <span className="text-[11px] text-slate-500">
                  {t("listings.filtersActive", { n: activeCount })}
                </span>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="h-3 w-3" />
                  {t("listings.clearAll")}
                </button>
              </div>
            )}
          </div>

          {/* Error state */}
          {error && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-red-800">
                  {t("listings.backendError")}
                </p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <p className="text-xs text-red-500 mt-2">
                  {t("listings.backendHintPre")}{" "}
                  <code className="font-mono">http://localhost:8011</code>.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Grid — 2 columns when the map panel is open, 3 when closed */}
          {!error && (
            <div
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 gap-4",
                !showMap && "lg:grid-cols-3",
              )}
            >
              {visible.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}

          {/* Empty states */}
          {!error && !loading && all.length > 0 && visibleList.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Search className="h-6 w-6 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">{t("listings.noMatch")}</p>
                <button
                  onClick={resetFilters}
                  className="mt-3 text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
                >
                  {t("listings.clearAll")}
                </button>
              </CardContent>
            </Card>
          )}

          {!error && !loading && all.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Home className="h-6 w-6 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">{t("listings.noneFound")}</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {!error && visibleList.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                {t("listings.prev")}
              </Button>
              <span className="text-sm text-slate-500 tabular-nums">
                {t("listings.page")} {page + 1} / {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= pages}
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              >
                {t("listings.next")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: map panel (sticky, hidden on small screens) ──────────── */}
      {showMap && (
        <div className="hidden lg:block w-[42%] max-w-[640px] shrink-0 p-3 pl-0 sticky top-0 h-full">
          <ListingsMap
            items={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBoundsChange={setBounds}
            searchInView={searchInView}
            onSearchInViewChange={setSearchInView}
            onCollapse={() => setShowMap(false)}
          />
        </div>
      )}
    </div>
  )
}
