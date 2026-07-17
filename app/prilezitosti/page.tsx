"use client"

// /prilezitosti — the ranked deal feed. The chart on top shows where listings
// sit vs. their okres median; the feed below ranks every scored listing by
// investment attractiveness (lib/opportunity.ts). The kraj chips on the chart
// filter the whole page — stats, feed and chart stay in sync.

import { useEffect, useMemo, useState } from "react"
import {
  Star,
  ArrowDownRight,
  Percent,
  BarChart3,
  Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PropertyOpportunityCard from "@/components/PropertyOpportunityCard"
import SortControl from "@/components/SortControl"
import OpportunitiesChart, {
  type OpportunityDatum,
} from "@/components/OpportunitiesChart"
import {
  fetchAllListings,
  fetchPriceDrops,
  type DealId,
  type Listing,
} from "@/lib/api"
import {
  buildOpportunities,
  sortOpportunities,
  type SortKey,
} from "@/lib/opportunity"
import { cn, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

// Radix SelectItem values must be non-empty, so "all districts" gets a sentinel.
const ALL = "__all__"

// The chart plots only the clear-cut deals — same threshold it always used.
const CHART_DISCOUNT = -10

// Labels live here (not in lib/i18n.tsx) so the page stays self-contained;
// the pre-existing opps.* keys it still uses are read-only.
const LABELS = {
  sk: {
    statCount: "Hodnotené inzeráty",
    statBelow: "Pod trhom",
    statAvgDiscount: "Priem. zľava",
    statAvgYield: "Priem. hrubý výnos",
    sale: "Predaj",
    rent: "Prenájom",
    allDistricts: "Všetky okresy",
    district: "Okres",
    belowOnly: "Len pod trhom",
    highConfOnly: "Len vysoká spoľahlivosť",
    clearFilters: "Zrušiť filtre",
    error: "Nepodarilo sa načítať inzeráty.",
  },
  en: {
    statCount: "Scored listings",
    statBelow: "Below market",
    statAvgDiscount: "Avg. discount",
    statAvgYield: "Avg. gross yield",
    sale: "For sale",
    rent: "For rent",
    allDistricts: "All districts",
    district: "District",
    belowOnly: "Below market only",
    highConfOnly: "High confidence only",
    clearFilters: "Clear filters",
    error: "Failed to load listings.",
  },
} as const

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "text-slate-900",
}: {
  icon: typeof Star
  label: string
  value: string
  tone?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          {label}
        </p>
        <p className={cn("mt-1 text-2xl font-bold tabular-nums", tone)}>{value}</p>
      </CardContent>
    </Card>
  )
}

export default function OpportunitiesPage() {
  const { t, lang } = useI18n()
  const labels = LABELS[lang === "en" ? "en" : "sk"]

  const [items, setItems] = useState<Listing[]>([])
  const [drops, setDrops] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dealType, setDealType] = useState<DealId>("sale")
  // Region (kraj) filter — owned here so the chart chips and everything
  // below stay in sync.
  const [region, setRegion] = useState<string | null>(null)
  const [district, setDistrict] = useState<string>(ALL)
  const [belowOnly, setBelowOnly] = useState(false)
  const [highConfOnly, setHighConfOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>("opportunity")

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        // Both deal types in one pull: sale rows are the feed, rent rows are
        // the yield medians. Price drops are best-effort decoration.
        const [data, priceDrops] = await Promise.all([
          fetchAllListings(),
          fetchPriceDrops({ limit: 500 }).catch(() => null),
        ])
        if (!alive) return
        setItems(data.items)
        if (priceDrops) {
          const map = new Map<string, number>()
          for (const d of priceDrops.items) {
            if (d.percentChange != null && !map.has(d.propertyId)) {
              map.set(d.propertyId, Math.abs(d.percentChange))
            }
          }
          setDrops(map)
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const scored = useMemo(
    () => buildOpportunities(items, drops),
    [items, drops],
  )

  const byDeal = useMemo(
    () => scored.filter((o) => o.listing.dealType === dealType),
    [scored, dealType],
  )

  // Chart input: the clear-cut discounts for the selected deal type. The
  // chart applies the kraj filter itself (and derives its chips from this).
  const chartData = useMemo<OpportunityDatum[]>(
    () =>
      byDeal
        .filter((o) => o.opp.diffPct < CHART_DISCOUNT)
        .map((o) => ({
          listing: o.listing,
          groupMedian: o.opp.groupMedianPpsm,
          discount: o.opp.diffPct,
          comparables: o.opp.comparables,
        }))
        .sort((a, b) => a.discount - b.discount),
    [byDeal],
  )

  // District (okres) options follow the selected kraj.
  const districts = useMemo(() => {
    const seen = new Set<string>()
    for (const o of byDeal) {
      if (region && o.listing.region !== region) continue
      if (o.listing.district) seen.add(o.listing.district)
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b, "sk"))
  }, [byDeal, region])

  const opps = useMemo(() => {
    let filtered = byDeal.filter((o) => {
      if (region && o.listing.region !== region) return false
      if (district !== ALL && o.listing.district !== district) return false
      return true
    })
    if (belowOnly) filtered = filtered.filter((o) => o.opp.position === "below")
    if (highConfOnly)
      filtered = filtered.filter((o) => o.opp.confidence === "High")
    return sortOpportunities(filtered, sort)
  }, [byDeal, region, district, belowOnly, highConfOnly, sort])

  // Headline stats over the current selection.
  const stats = useMemo(() => {
    const below = opps.filter((o) => o.opp.position === "below")
    const avgDiscount =
      below.length > 0
        ? below.reduce((s, o) => s + o.opp.diffPct, 0) / below.length
        : null
    const yields = opps
      .map((o) => o.opp.grossYield)
      .filter((v): v is number => v != null)
    const avgYield =
      yields.length > 0 ? yields.reduce((s, v) => s + v, 0) / yields.length : null
    return { count: opps.length, below: below.length, avgDiscount, avgYield }
  }, [opps])

  const handleDealTypeChange = (d: DealId) => {
    setDealType(d)
    // Sale and rent have different kraj/okres coverage; a carried-over
    // selection would be an invisible filter the chips no longer show.
    setRegion(null)
    setDistrict(ALL)
  }

  const handleRegionChange = (r: string | null) => {
    setRegion(r)
    // The okres list changes with the kraj; a stale selection would silently
    // empty the feed.
    setDistrict(ALL)
  }

  const handleClear = () => {
    handleRegionChange(null)
    setBelowOnly(false)
    setHighConfOnly(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-900">
          <Star className="h-5 w-5 text-slate-400" />
          <h1 className="text-2xl font-bold tracking-tight">{t("opps.title")}</h1>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          {loading
            ? t("common.loading")
            : t("opps.subtitle", { n: formatNumber(chartData.length) })}
        </p>
      </div>

      {/* Chart — kraj chips here drive the whole page */}
      {!loading && !error && (
        <OpportunitiesChart
          opportunities={chartData}
          region={region}
          onRegionChange={handleRegionChange}
        />
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label={labels.statCount}
          value={loading ? "…" : formatNumber(stats.count)}
        />
        <StatCard
          icon={ArrowDownRight}
          label={labels.statBelow}
          value={loading ? "…" : formatNumber(stats.below)}
          tone="text-emerald-600"
        />
        <StatCard
          icon={ArrowDownRight}
          label={labels.statAvgDiscount}
          value={
            loading || stats.avgDiscount == null
              ? "—"
              : `${stats.avgDiscount.toFixed(1)} %`
          }
          tone="text-emerald-600"
        />
        <StatCard
          icon={Percent}
          label={labels.statAvgYield}
          value={
            loading || stats.avgYield == null
              ? "—"
              : `${stats.avgYield.toFixed(1)} %`
          }
        />
      </div>

      {/* Filter toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Sale / Rent */}
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {(["sale", "rent"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDealTypeChange(d)}
              aria-pressed={d === dealType}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                d === dealType
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {d === "sale" ? labels.sale : labels.rent}
            </button>
          ))}
        </div>

        {/* District (okres) */}
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="h-8 w-44 text-xs" aria-label={labels.district}>
            <SelectValue placeholder={labels.district} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{labels.allDistricts}</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quality toggles */}
        {(
          [
            { on: belowOnly, set: setBelowOnly, label: labels.belowOnly },
            { on: highConfOnly, set: setHighConfOnly, label: labels.highConfOnly },
          ] as const
        ).map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => f.set(!f.on)}
            aria-pressed={f.on}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
              f.on
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400",
            )}
          >
            {f.label}
          </button>
        ))}

        <div className="ml-auto">
          <SortControl value={sort} onChange={setSort} />
        </div>
      </div>

      {/* Feed */}
      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-red-800">{labels.error}</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[220px] animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : opps.length > 0 ? (
        <div className="grid items-start gap-3 lg:grid-cols-2">
          {opps.map((item) => (
            <PropertyOpportunityCard key={item.listing.id} item={item} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Search className="mx-auto mb-3 h-6 w-6 text-slate-400" />
            <p className="font-medium text-slate-500">{t("opps.empty")}</p>
            <button
              onClick={handleClear}
              className="mt-3 text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
            >
              {labels.clearFilters}
            </button>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-[11px] text-slate-400 max-w-2xl">
        {t("opps.disclaimer")}
      </p>
    </div>
  )
}
