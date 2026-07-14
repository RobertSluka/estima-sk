"use client"

import { useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatEUR } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import {
  NATIONAL,
  REGION_SERIES,
  TYPE_SERIES,
  NBS_LATEST_PERIOD,
  type RegionKey,
  type TypeKey,
  type RegionPoint,
  type TypePoint,
} from "@/lib/nbs"

// ── Series metadata ──────────────────────────────────────────────────────────
// Kraj names are shown as-is in both languages (as in lib/market.ts). SR total
// is the anchor line (slate); regions get a distinct qualitative palette.
const REGION_META: { key: RegionKey; name: string; color: string }[] = [
  { key: "SR", name: "SR — spolu", color: "#0f172a" }, // slate-900
  { key: "BA", name: "Bratislavský", color: "#10b981" }, // emerald-500
  { key: "KE", name: "Košický", color: "#6366f1" }, // indigo-500
  { key: "PO", name: "Prešovský", color: "#f59e0b" }, // amber-500
  { key: "ZA", name: "Žilinský", color: "#ec4899" }, // pink-500
  { key: "TN", name: "Trenčiansky", color: "#14b8a6" }, // teal-500
  { key: "BB", name: "Banskobystrický", color: "#8b5cf6" }, // violet-500
  { key: "TT", name: "Trnavský", color: "#ef4444" }, // red-500
  { key: "NR", name: "Nitriansky", color: "#3b82f6" }, // blue-500
]

const TYPE_META: { key: TypeKey; labelKey: string; color: string }[] = [
  { key: "flatsTotal", labelKey: "market.typeFlatsTotal", color: "#10b981" },
  { key: "housesTotal", labelKey: "market.typeHousesTotal", color: "#0f172a" },
  { key: "r1", labelKey: "market.type1r", color: "#6366f1" },
  { key: "r2", labelKey: "market.type2r", color: "#f59e0b" },
  { key: "r3", labelKey: "market.type3r", color: "#ec4899" },
  { key: "r4", labelKey: "market.type4r", color: "#14b8a6" },
  { key: "r5plus", labelKey: "market.type5r", color: "#8b5cf6" },
]

type View = "national" | "region" | "type"
type Metric = "price" | "index" | "yoy"

// Show one tick per year: annual points (2002-2004) and every Q1.
const YEAR_TICKS = NATIONAL.filter(
  (p) => !p.period.includes("Q") || p.period.startsWith("1Q"),
).map((p) => p.period)

const yearOf = (period: string) => period.slice(-4)

const latest = NATIONAL[NATIONAL.length - 1]

// ── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipRow {
  name: string
  value: number
  color: string
}

function ChartTooltip({
  active,
  label,
  rows,
  format,
}: {
  active?: boolean
  label?: string
  rows?: TooltipRow[]
  format: (v: number) => string
}) {
  if (!active || !rows || !rows.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="mb-1 text-xs font-semibold text-slate-900">{label}</div>
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: r.color }}
            />
            <span className="text-slate-500">{r.name}</span>
            <span className="ml-auto font-medium tabular-nums text-slate-900">
              {format(r.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MarketInsights() {
  const { t } = useI18n()
  const [view, setView] = useState<View>("national")
  const [metric, setMetric] = useState<Metric>("price")
  const [hiddenRegions, setHiddenRegions] = useState<Set<RegionKey>>(new Set())
  const [hiddenTypes, setHiddenTypes] = useState<Set<TypeKey>>(new Set())

  const formatMetric = useMemo(() => {
    if (metric === "price") return (v: number) => `${formatEUR(v)}/m²`
    if (metric === "yoy") return (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)} %`
    return (v: number) => v.toFixed(0)
  }, [metric])

  const nationalYFormat =
    metric === "price"
      ? (v: number) => `${Math.round(v / 100) / 10}k`
      : metric === "yoy"
        ? (v: number) => `${v} %`
        : (v: number) => `${v}`

  const views: { id: View; label: string }[] = [
    { id: "national", label: t("market.tabNational") },
    { id: "region", label: t("market.tabRegion") },
    { id: "type", label: t("market.tabType") },
  ]

  const metrics: { id: Metric; label: string }[] = [
    { id: "price", label: t("market.metricPrice") },
    { id: "index", label: t("market.metricIndex") },
    { id: "yoy", label: t("market.metricYoy") },
  ]

  const toggleRegion = (k: RegionKey) =>
    setHiddenRegions((prev) => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  const toggleType = (k: TypeKey) =>
    setHiddenTypes((prev) => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })

  return (
    <div className="space-y-6">
      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t("market.statLatestPrice")} value={`${formatEUR(latest.price)}/m²`} />
        <Stat
          label={t("market.statYoy")}
          value={`${latest.yoy > 0 ? "+" : ""}${latest.yoy.toFixed(1)} %`}
          accent={latest.yoy >= 0 ? "up" : "down"}
        />
        <Stat label={t("market.statIndex")} value={latest.index.toFixed(0)} />
        <Stat
          label={t("market.statGrowth")}
          value={`${(latest.index / 100).toFixed(1)}×`}
        />
      </div>

      <Card>
        <CardContent className="p-5">
          {/* View + metric switchers */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegTabs items={views} value={view} onChange={setView} />
            {view === "national" && (
              <SegTabs items={metrics} value={metric} onChange={setMetric} small />
            )}
          </div>

          {/* Chart */}
          <div className="mt-5">
            {view === "national" ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={NATIONAL}
                  margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="period"
                    ticks={YEAR_TICKS}
                    tickFormatter={yearOf}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={12}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={nationalYFormat}
                    width={40}
                  />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <ChartTooltip
                        active={active}
                        label={label as string}
                        format={formatMetric}
                        rows={(payload ?? []).map((p) => ({
                          name: t("market.metricPrice"),
                          value: p.value as number,
                          color: "#10b981",
                        }))}
                      />
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : view === "region" ? (
              <MultiChart
                data={REGION_SERIES}
                meta={REGION_META.map((m) => ({ ...m, label: m.name }))}
                hidden={hiddenRegions as Set<string>}
              />
            ) : (
              <MultiChart
                data={TYPE_SERIES}
                meta={TYPE_META.map((m) => ({
                  key: m.key,
                  color: m.color,
                  label: t(m.labelKey),
                }))}
                hidden={hiddenTypes as Set<string>}
              />
            )}
          </div>

          {/* Series legend / toggles */}
          {view === "region" && (
            <Legend
              items={REGION_META.map((m) => ({ key: m.key, label: m.name, color: m.color }))}
              hidden={hiddenRegions as Set<string>}
              onToggle={(k) => toggleRegion(k as RegionKey)}
            />
          )}
          {view === "type" && (
            <Legend
              items={TYPE_META.map((m) => ({
                key: m.key,
                label: t(m.labelKey),
                color: m.color,
              }))}
              hidden={hiddenTypes as Set<string>}
              onToggle={(k) => toggleType(k as TypeKey)}
            />
          )}

          <p className="mt-4 text-xs text-slate-400">
            {t("market.sourceNote", { period: NBS_LATEST_PERIOD })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Multi-series line chart (region / type) ──────────────────────────────────
function MultiChart({
  data,
  meta,
  hidden,
}: {
  data: RegionPoint[] | TypePoint[]
  meta: { key: string; label: string; color: string }[]
  hidden: Set<string>
}) {
  const visible = meta.filter((m) => !hidden.has(m.key))
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="period"
          ticks={YEAR_TICKS}
          tickFormatter={yearOf}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          minTickGap={12}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${Math.round(v / 100) / 10}k`}
          width={40}
        />
        <Tooltip
          content={({ active, label, payload }) => (
            <ChartTooltip
              active={active}
              label={label as string}
              format={(v) => `${formatEUR(v)}/m²`}
              rows={(payload ?? [])
                .map((p) => {
                  const m = meta.find((x) => x.key === p.dataKey)
                  return m
                    ? { name: m.label, value: p.value as number, color: m.color }
                    : null
                })
                .filter(Boolean)
                .sort((a, b) => (b!.value as number) - (a!.value as number)) as TooltipRow[]}
            />
          )}
        />
        {visible.map((m) => (
          <Line
            key={m.key}
            type="monotone"
            dataKey={m.key}
            stroke={m.color}
            strokeWidth={m.key === "SR" ? 2.5 : 1.75}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Small UI primitives ──────────────────────────────────────────────────────
function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "up" | "down"
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-bold tracking-tight",
          accent === "up" && "text-emerald-600",
          accent === "down" && "text-red-500",
          !accent && "text-slate-900",
        )}
      >
        {value}
      </div>
    </div>
  )
}

function SegTabs<T extends string>({
  items,
  value,
  onChange,
  small,
}: {
  items: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
  small?: boolean
}) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 p-0.5">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            "rounded px-3 py-1 font-semibold transition-colors",
            small ? "text-[11px]" : "text-xs",
            value === it.id
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-900",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

function Legend({
  items,
  hidden,
  onToggle,
}: {
  items: { key: string; label: string; color: string }[]
  hidden: Set<string>
  onToggle: (k: string) => void
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((it) => {
        const off = hidden.has(it.key)
        return (
          <button
            key={it.key}
            onClick={() => onToggle(it.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
              off
                ? "border-slate-200 text-slate-300"
                : "border-slate-200 text-slate-600 hover:border-slate-300",
            )}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: off ? "#cbd5e1" : it.color }}
            />
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
