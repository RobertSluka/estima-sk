"use client"

// /barometer — is the Slovak market heating up or cooling down? A composite
// 0–100 "market heat" gauge built from real series: Estima asking-price index
// (/market-index), supply counts, realized NBS quarterly prices (lib/nbs.ts)
// and price-drop share (/price-drops). Every input is shown as its own signal
// row so the headline number is explainable, never a black box.
//
// Listing-level signals (days on market, drop share) are derived from
// first-seen timestamps, so they only become meaningful once the dataset has
// been observed for a while — they are gated on MIN_OBSERVED_DAYS instead of
// reporting artifacts of a young database.

import { useEffect, useMemo, useState } from "react"
import { Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import {
  fetchAllListings,
  fetchMarketIndex,
  fetchPriceDrops,
  type DealId,
  type Listing,
  type MarketIndexPoint,
} from "@/lib/api"
import { NATIONAL, NBS_LATEST_PERIOD } from "@/lib/nbs"
import { useI18n } from "@/lib/i18n"
import { cn, formatNumber } from "@/lib/utils"

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// Listing-level signals stay hidden until the snapshot history is old enough
// to make "days on market" and "share with a price cut" honest numbers.
const MIN_OBSERVED_DAYS = 21

// % change between the latest point and the one closest to `days` ago (falls
// back to the earliest point when the series is younger than the window).
function windowChange(
  series: MarketIndexPoint[],
  days: number,
  pick: (p: MarketIndexPoint) => number | null,
): number | null {
  const pts = series.filter((p) => pick(p) != null)
  if (pts.length < 2) return null
  const last = pts[pts.length - 1]
  const target = new Date(last.date).getTime() - days * 86_400_000
  let base = pts[0]
  for (const p of pts) {
    if (new Date(p.date).getTime() <= target) base = p
    else break
  }
  const from = pick(base)!
  const to = pick(last)!
  if (from === 0 || base.date === last.date) return null
  return ((to - from) / from) * 100
}

// Realized QoQ change from the latest two NBS quarterly points (sale only —
// NBS does not publish rents).
function nbsQoQ(): number | null {
  const quarterly = NATIONAL.filter((p) => p.period.includes("Q"))
  if (quarterly.length < 2) return null
  const prev = quarterly[quarterly.length - 2]
  const last = quarterly[quarterly.length - 1]
  if (prev.price === 0) return null
  return ((last.price - prev.price) / prev.price) * 100
}

interface Signal {
  key: string
  /** Human-readable value, e.g. "+2.4%" or "38d". */
  display: string
  /** Contribution to the heat score, in points. */
  pts: number
}

// The heat model: 50 = balanced; each signal shifts it a bounded number of
// points so no single input can dominate. Weights are a product decision, not
// statistics — the signal rows keep the result auditable.
function computeHeat(inputs: {
  momentum30: number | null // 30d asking price/m² change, %
  supply30: number | null // 30d active-listing change, %
  nbs: number | null // realized QoQ change, %
  avgDom: number | null // days
  dropShare: number | null // 0–100 %
}): { score: number; signals: Signal[] } {
  const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`
  const signals: Signal[] = []

  const add = (key: string, display: string, pts: number) =>
    signals.push({ key, display, pts: Math.round(pts * 10) / 10 })

  if (inputs.momentum30 != null)
    add("momentum30", pct(inputs.momentum30), clamp(inputs.momentum30 * 4, -20, 20))
  if (inputs.nbs != null)
    add("nbs", pct(inputs.nbs), clamp(inputs.nbs * 3, -15, 15))
  // Shrinking supply heats the market, growing supply cools it.
  if (inputs.supply30 != null)
    add("supply30", pct(inputs.supply30), clamp(-inputs.supply30, -10, 10))
  // ~45 days on market ≈ neutral; faster absorption = hotter.
  if (inputs.avgDom != null)
    add("dom", `${Math.round(inputs.avgDom)}d`, clamp(((45 - inputs.avgDom) / 45) * 10, -10, 10))
  // Widespread price cuts are a cooling signal.
  if (inputs.dropShare != null)
    add("drops", `${Math.round(inputs.dropShare)}%`, clamp(-(inputs.dropShare - 20) / 4, -8, 8))

  const score = Math.round(
    clamp(50 + signals.reduce((s, x) => s + x.pts, 0), 3, 97),
  )
  return { score, signals }
}

// Five-band label for a heat score.
function heatBand(score: number): { key: string; tone: string } {
  if (score < 25) return { key: "cold", tone: "text-sky-600" }
  if (score < 42) return { key: "cool", tone: "text-teal-600" }
  if (score < 58) return { key: "balanced", tone: "text-slate-600" }
  if (score < 75) return { key: "warm", tone: "text-amber-600" }
  return { key: "hot", tone: "text-rose-600" }
}

const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]
}

// Semicircular gauge: 180° (score 0, left) → 0° (score 100, right).
function HeatGauge({ score }: { score: number }) {
  const bands = [
    { from: 0, to: 25, color: "#0ea5e9" },
    { from: 25, to: 42, color: "#14b8a6" },
    { from: 42, to: 58, color: "#94a3b8" },
    { from: 58, to: 75, color: "#f59e0b" },
    { from: 75, to: 100, color: "#f43f5e" },
  ]
  const arc = (from: number, to: number) => {
    const [x1, y1] = polar(100, 96, 80, 180 - from * 1.8)
    const [x2, y2] = polar(100, 96, 80, 180 - to * 1.8)
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A 80 80 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }
  const [nx, ny] = polar(100, 96, 62, 180 - score * 1.8)

  return (
    <svg viewBox="0 0 200 104" className="w-full max-w-[260px]">
      {bands.map((b) => (
        <path
          key={b.from}
          d={arc(b.from + 1, b.to - 1)}
          fill="none"
          stroke={b.color}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.9}
        />
      ))}
      <line
        x1={100}
        y1={96}
        x2={nx}
        y2={ny}
        stroke="#0f172a"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={100} cy={96} r={5} fill="#0f172a" />
    </svg>
  )
}

function ChangeIcon({ value }: { value: number | null }) {
  if (value == null || value === 0)
    return <Minus className="h-3 w-3 text-slate-400" />
  return value > 0 ? (
    <TrendingUp className="h-3 w-3 text-emerald-600" />
  ) : (
    <TrendingDown className="h-3 w-3 text-rose-600" />
  )
}

function Kpi({
  label,
  value,
  change,
  hint,
}: {
  label: string
  value: string
  change?: number | null
  hint?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-xl font-bold tabular-nums text-slate-900">{value}</p>
          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
                change == null || change === 0
                  ? "text-slate-400"
                  : change > 0
                    ? "text-emerald-600"
                    : "text-rose-600",
              )}
            >
              <ChangeIcon value={change ?? null} />
              {change == null ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`}
            </span>
          )}
        </div>
        {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
      </CardContent>
    </Card>
  )
}

function SeriesTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean
  payload?: { payload: MarketIndexPoint }[]
  metric: "price" | "count"
}) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-slate-500">{p.date}</p>
      <p className="text-sm font-bold text-slate-900">
        {metric === "price"
          ? p.medianPricePerSqm != null
            ? `${formatNumber(Math.round(p.medianPricePerSqm))} €/m²`
            : "—"
          : formatNumber(p.propertyCount)}
      </p>
    </div>
  )
}

function TrendChart({
  series,
  dataKey,
  metric,
  emptyLabel,
}: {
  series: MarketIndexPoint[]
  dataKey: "medianPricePerSqm" | "propertyCount"
  metric: "price" | "count"
  emptyLabel: string
}) {
  if (series.length === 0) return <p className="text-sm text-slate-400">{emptyLabel}</p>
  const gradientId = `baro-${dataKey}`
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tickFormatter={(iso: string) => {
            const [, m, d] = iso.split("-")
            return `${Number(d)}.${Number(m)}.`
          }}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={["auto", "auto"]}
        />
        <Tooltip content={<SeriesTooltip metric={metric} />} cursor={{ stroke: "#e2e8f0" }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#0f172a"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function BarometerPage() {
  const { t } = useI18n()

  const [kind, setKind] = useState<DealId>("sale")
  const [series, setSeries] = useState<MarketIndexPoint[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [droppedIds, setDroppedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    // Only the index series is load-bearing — listings and price drops enrich
    // the score but must not sink the page when unavailable.
    Promise.all([
      fetchMarketIndex(kind),
      fetchAllListings({ dealType: kind }).catch(() => null),
      fetchPriceDrops({ dealType: kind, sinceDays: 30, limit: 500 }).catch(() => null),
    ])
      .then(([idx, all, drops]) => {
        if (!alive) return
        setSeries(idx.series)
        setListings(all?.items ?? [])
        setDroppedIds(new Set((drops?.items ?? []).map((d) => d.propertyId)))
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [kind])

  // Days observed = span from the oldest first-seen to now; below the
  // threshold the listing-level signals are withheld (see header comment).
  const listingSignals = useMemo(() => {
    const seen = listings
      .map((l) => (l.firstSeenAt ? new Date(l.firstSeenAt).getTime() : null))
      .filter((x): x is number => x != null && !Number.isNaN(x))
    if (seen.length === 0) return { avgDom: null, dropShare: null, observedDays: 0 }
    const now = Date.now()
    const observedDays = (now - Math.min(...seen)) / 86_400_000
    if (observedDays < MIN_OBSERVED_DAYS)
      return { avgDom: null, dropShare: null, observedDays }
    const avgDom = seen.reduce((s, x) => s + (now - x) / 86_400_000, 0) / seen.length
    const dropped = listings.filter((l) => droppedIds.has(l.id)).length
    return {
      avgDom,
      dropShare: (dropped / listings.length) * 100,
      observedDays,
    }
  }, [listings, droppedIds])

  const momentum30 = useMemo(
    () => windowChange(series, 30, (p) => p.medianPricePerSqm),
    [series],
  )
  const supply30 = useMemo(
    () => windowChange(series, 30, (p) => p.propertyCount),
    [series],
  )
  const nbs = useMemo(() => (kind === "sale" ? nbsQoQ() : null), [kind])

  const { score, signals } = useMemo(
    () =>
      computeHeat({
        momentum30,
        supply30,
        nbs,
        avgDom: listingSignals.avgDom,
        dropShare: listingSignals.dropShare,
      }),
    [momentum30, supply30, nbs, listingSignals],
  )
  const band = heatBand(score)

  const latest = series.length > 0 ? series[series.length - 1] : null
  const unit = kind === "sale" ? "€/m²" : "€/m²/mes."

  const signalLabels: Record<string, string> = {
    momentum30: t("baro.sigMomentum"),
    nbs: t("baro.sigNbs"),
    supply30: t("baro.sigSupply"),
    dom: t("baro.sigDom"),
    drops: t("baro.sigDrops"),
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-900">
          <Gauge className="h-5 w-5 text-slate-400" />
          <h1 className="text-xl font-bold tracking-tight">{t("baro.title")}</h1>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{t("baro.subtitle")}</p>

        {/* Sale / Rent switcher */}
        <div className="mt-4 inline-flex rounded-lg bg-slate-100 p-0.5">
          {(["sale", "rent"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={k === kind}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                k === kind
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {t(k === "sale" ? "listings.dealSale" : "listings.dealRent")}
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
      ) : loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gauge + signal breakdown */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col items-center p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {t("baro.heatScore")}
                </p>
                <HeatGauge score={score} />
                <div className="-mt-2 text-center">
                  <p className="text-3xl font-bold tabular-nums text-slate-900">
                    {score}
                  </p>
                  <p className={cn("text-sm font-semibold", band.tone)}>
                    {t(`baro.band.${band.key}`)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="border-b border-slate-100 px-5 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t("baro.signals")}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">{t("baro.signalsHint")}</p>
                </div>
                <ul className="divide-y divide-slate-50">
                  {signals.map((s) => (
                    <li key={s.key} className="flex items-center gap-3 px-5 py-2.5">
                      <span className="flex-1 text-xs font-medium text-slate-600">
                        {signalLabels[s.key] ?? s.key}
                      </span>
                      <span className="w-16 text-right text-xs font-semibold tabular-nums text-slate-900">
                        {s.display}
                      </span>
                      <span
                        className={cn(
                          "w-16 rounded-full px-2 py-0.5 text-center text-[11px] font-bold tabular-nums",
                          s.pts > 0
                            ? "bg-rose-50 text-rose-600"
                            : s.pts < 0
                              ? "bg-sky-50 text-sky-600"
                              : "bg-slate-50 text-slate-400",
                        )}
                      >
                        {s.pts > 0 ? "+" : ""}
                        {s.pts}
                      </span>
                    </li>
                  ))}
                  {signals.length === 0 && (
                    <li className="px-5 py-8 text-center text-sm text-slate-400">
                      {t("baro.noSignals")}
                    </li>
                  )}
                </ul>
                {listingSignals.observedDays > 0 &&
                  listingSignals.observedDays < MIN_OBSERVED_DAYS && (
                    <p className="border-t border-slate-100 px-5 py-2.5 text-[11px] text-slate-400">
                      {t("baro.youngData", {
                        days: Math.max(1, Math.round(listingSignals.observedDays)),
                        min: MIN_OBSERVED_DAYS,
                      })}
                    </p>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label={t("baro.kpiMedian")}
              value={
                latest?.medianPricePerSqm != null
                  ? `${formatNumber(Math.round(latest.medianPricePerSqm))} ${unit}`
                  : "—"
              }
              change={momentum30}
              hint={t("baro.kpi30d")}
            />
            <Kpi
              label={t("baro.kpiSupply")}
              value={latest ? formatNumber(latest.propertyCount) : "—"}
              change={supply30}
              hint={t("baro.kpi30d")}
            />
            <Kpi
              label={t("baro.kpiNbs")}
              value={nbs == null ? "—" : `${nbs > 0 ? "+" : ""}${nbs.toFixed(1)}%`}
              hint={t("baro.kpiNbsHint", { period: NBS_LATEST_PERIOD })}
            />
            <Kpi
              label={t("baro.kpiDom")}
              value={
                listingSignals.avgDom != null
                  ? `${Math.round(listingSignals.avgDom)}d`
                  : "—"
              }
              hint={t("baro.kpiDomHint")}
            />
          </div>

          {/* Asking-price index */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                {t("baro.indexTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">{t("baro.indexHint")}</p>
              <div className="mt-4">
                <TrendChart
                  series={series}
                  dataKey="medianPricePerSqm"
                  metric="price"
                  emptyLabel={t("baro.noData")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Supply over time */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                {t("baro.supplyTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">{t("baro.supplyHint")}</p>
              <div className="mt-4">
                <TrendChart
                  series={series}
                  dataKey="propertyCount"
                  metric="count"
                  emptyLabel={t("baro.noData")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
