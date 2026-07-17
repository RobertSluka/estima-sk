"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import type { Listing } from "@/lib/api"
import { formatEUR, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

export interface OpportunityDatum {
  listing: Listing
  groupMedian: number
  discount: number // negative % vs group median
  comparables: number
}

interface Point {
  x: number // group median €/m² (the market index level)
  y: number // % below that median
  o: OpportunityDatum
}

// Labels live here (not in lib/i18n.tsx) so the chart stays self-contained.
const LABELS = {
  sk: {
    title: "Pod trhovou hodnotou",
    subtitle:
      "Každý bod je inzerát. Čím nižšie pod čiarou, tým väčšia zľava oproti mediánu svojho okresu.",
    marketLine: "Medián okresu (trhová hodnota)",
    xAxis: "Medián okresu (€/m²)",
    yAxis: "Odchýlka od mediánu",
    allRegions: "Všetky kraje",
    median: "Medián okresu",
    vs: "oproti",
  },
  en: {
    title: "Below market value",
    subtitle:
      "Each dot is a listing. The further below the line, the bigger the discount vs its district median.",
    marketLine: "District median (market value)",
    xAxis: "District median (€/m²)",
    yAxis: "Deviation from median",
    allRegions: "All regions",
    median: "District median",
    vs: "vs",
  },
} as const

const DOT = "#059669" // emerald-600 — house "discount" color, ≥3:1 on white

function DotShape({
  cx,
  cy,
  point,
  onEnter,
  onLeave,
}: {
  cx?: number
  cy?: number
  point: Point
  onEnter: (p: Point, cx: number, cy: number) => void
  onLeave: () => void
}) {
  if (cx == null || cy == null) return null
  // Mouse events live directly on the SVG element (recharts' own tooltip
  // plumbing is unreliable for scatter hover). The invisible outer circle
  // widens the target so hovering near the dot is enough.
  return (
    <g
      style={{ cursor: "pointer" }}
      onMouseEnter={() => onEnter(point, cx, cy)}
      onMouseLeave={onLeave}
    >
      <circle cx={cx} cy={cy} r={16} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={5.5}
        fill={DOT}
        fillOpacity={0.85}
        stroke="#fff"
        strokeWidth={1.5}
      />
    </g>
  )
}

function TooltipCard({
  o,
  labels,
}: {
  o: OpportunityDatum
  labels: (typeof LABELS)[keyof typeof LABELS]
}) {
  const l = o.listing
  return (
    <div className="w-[260px] rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-900 truncate">{l.name ?? "—"}</p>
      <p className="text-[11px] text-slate-400 truncate">
        {[l.locality, l.district, l.layout].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        <span className="font-medium tabular-nums text-slate-900">
          {l.pricePerSqm != null ? `${formatEUR(Math.round(l.pricePerSqm))}/m²` : "—"}
        </span>
        <span className="text-slate-400">
          {labels.vs} {formatEUR(Math.round(o.groupMedian))}/m²
        </span>
        <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 tabular-nums">
          {o.discount.toFixed(0)} %
        </span>
      </div>
    </div>
  )
}

export default function OpportunitiesChart({
  opportunities,
  region,
  onRegionChange,
}: {
  opportunities: OpportunityDatum[]
  region: string | null
  onRegionChange: (region: string | null) => void
}) {
  const { lang } = useI18n()
  const router = useRouter()
  const labels = LABELS[lang === "en" ? "en" : "sk"]

  // Tooltip is plain React state driven by the symbols' mouse events —
  // recharts' own <Tooltip> is unreliable on scatter charts (hover often
  // doesn't activate it), so we position our own card at the dot.
  const [hover, setHover] = useState<{ p: Point; cx: number; cy: number } | null>(null)

  const regions = useMemo(() => {
    const set = new Set<string>()
    for (const o of opportunities) if (o.listing.region) set.add(o.listing.region)
    return Array.from(set).sort((a, b) => a.localeCompare(b, "sk"))
  }, [opportunities])

  const points = useMemo<Point[]>(
    () =>
      opportunities
        .filter((o) => !region || o.listing.region === region)
        .map((o) => ({ x: Math.round(o.groupMedian), y: o.discount, o })),
    [opportunities, region],
  )

  // Market-line label follows the region filter: the selected kraj plus the
  // median €/m² of its visible points, so switching regions visibly
  // re-anchors what the line stands for. All-regions keeps the generic label
  // (one median across differently-priced kraje would mislead).
  const marketLineLabel = useMemo(() => {
    if (!region || points.length === 0) return labels.marketLine
    const xs = points.map((p) => p.x).sort((a, b) => a - b)
    const mid = Math.floor(xs.length / 2)
    const med = xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2
    return `${region} kraj · ${labels.median} ~${formatEUR(Math.round(med))}/m²`
  }, [points, region, labels])

  if (opportunities.length === 0) return null

  const yMin = Math.min(-20, Math.floor((Math.min(...points.map((p) => p.y)) - 4) / 10) * 10)

  return (
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{labels.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">{labels.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[null, ...regions].map((r) => (
              <button
                key={r ?? "all"}
                onClick={() => {
                  setHover(null)
                  onRegionChange(r)
                }}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  region === r
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {r ?? labels.allRegions}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[
                  (min: number) => Math.max(0, Math.floor((min - 150) / 250) * 250),
                  (max: number) => Math.ceil((max + 150) / 250) * 250,
                ]}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tickFormatter={(v: number) => formatNumber(v)}
                label={{
                  value: labels.xAxis,
                  position: "insideBottomRight",
                  offset: -2,
                  fontSize: 11,
                  fill: "#94a3b8",
                }}
                height={40}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[yMin, 0]}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v} %`}
                width={48}
              />
              <ReferenceLine
                y={0}
                stroke="#0f172a"
                strokeDasharray="6 4"
                label={{
                  value: marketLineLabel,
                  position: "insideBottomRight",
                  fontSize: 11,
                  fill: "#0f172a",
                  dy: 22,
                }}
              />
              <Scatter
                data={points}
                shape={(raw: unknown) => {
                  const p = raw as { cx?: number; cy?: number; payload: Point }
                  return (
                    <DotShape
                      cx={p.cx}
                      cy={p.cy}
                      point={p.payload}
                      onEnter={(pt, cx, cy) => setHover({ p: pt, cx, cy })}
                      onLeave={() => setHover(null)}
                    />
                  )
                }}
                isAnimationActive={false}
                onClick={(p: Point) => {
                  const id = p?.o?.listing.id
                  if (id) router.push(`/inzeraty/${encodeURIComponent(id)}`)
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>

          {hover && (
            <div
              className="pointer-events-none absolute z-10"
              style={{
                left: hover.cx,
                top: hover.cy,
                // Flip below the dot when there is no room above it.
                transform:
                  hover.cy < 110
                    ? "translate(-50%, 14px)"
                    : "translate(-50%, calc(-100% - 14px))",
              }}
            >
              <TooltipCard o={hover.p.o} labels={labels} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
