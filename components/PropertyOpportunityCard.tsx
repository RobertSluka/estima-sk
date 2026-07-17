"use client"

import Link from "next/link"
import {
  MapPin,
  Home,
  Maximize2,
  TrendingDown,
  ArrowDownRight,
  ShieldCheck,
  Clock,
  Wallet,
  Percent,
} from "lucide-react"
import { cn, formatEUR, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import type { Confidence, OppListing } from "@/lib/opportunity"

// Labels live here (not in lib/i18n.tsx) so the card stays self-contained.
const LABELS = {
  sk: {
    belowMarket: "pod trhom",
    aboveMarket: "nad trhom",
    atMarket: "Na úrovni trhu",
    marketEstimate: "Trhový odhad",
    estRent: "Odhad nájmu",
    grossYield: "Hrubý výnos",
    confidence: "Spoľahlivosť",
    onMarket: "V ponuke",
    score: "Skóre",
    scoreTitle: "Skóre príležitosti",
    comparables: "porovnateľných",
    conf: { High: "Vysoká", Medium: "Stredná", Low: "Nízka" } as Record<Confidence, string>,
  },
  en: {
    belowMarket: "below market",
    aboveMarket: "above market",
    atMarket: "At market price",
    marketEstimate: "Market estimate",
    estRent: "Est. rent",
    grossYield: "Gross yield",
    confidence: "Confidence",
    onMarket: "On market",
    score: "Score",
    scoreTitle: "Opportunity score",
    comparables: "comparables",
    conf: { High: "High", Medium: "Medium", Low: "Low" } as Record<Confidence, string>,
  },
} as const

function scoreTone(score: number) {
  if (score >= 80) return { ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" }
  if (score >= 65) return { ring: "ring-teal-200", bg: "bg-teal-50", text: "text-teal-700", bar: "bg-teal-500" }
  if (score >= 50) return { ring: "ring-slate-200", bg: "bg-slate-50", text: "text-slate-600", bar: "bg-slate-400" }
  return { ring: "ring-amber-200", bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" }
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "text-slate-700",
}: {
  icon: typeof Wallet
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className={cn("text-xs font-semibold mt-0.5 truncate", tone)}>{value}</p>
    </div>
  )
}

export default function PropertyOpportunityCard({ item }: { item: OppListing }) {
  const { lang } = useI18n()
  const labels = LABELS[lang === "en" ? "en" : "sk"]
  const { listing: l, opp } = item
  const tone = scoreTone(opp.score)

  const diffLabel =
    opp.position === "below"
      ? `${opp.diffPct.toFixed(1)} % ${labels.belowMarket}`
      : opp.position === "over"
        ? `+${opp.diffPct.toFixed(1)} % ${labels.aboveMarket}`
        : labels.atMarket
  const diffTone =
    opp.position === "below"
      ? "text-emerald-600"
      : opp.position === "over"
        ? "text-amber-600"
        : "text-slate-500"

  return (
    <Link
      href={`/inzeraty/${encodeURIComponent(l.id)}`}
      className="group relative block rounded-xl border border-slate-200 bg-white p-3 transition-all duration-150 hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex gap-3">
        {/* Thumbnail — deliberately small so data leads, not the photo */}
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {l.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={l.imageUrl}
              alt={l.name ?? ""}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Home className="h-5 w-5 text-slate-300" />
            </div>
          )}
          {opp.priceDrop != null && (
            <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded bg-rose-600 px-1 py-0.5 text-[9px] font-bold text-white shadow">
              <TrendingDown className="h-2.5 w-2.5" />
              {opp.priceDrop.toFixed(1)} %
            </span>
          )}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="block truncate text-sm font-semibold text-slate-900 group-hover:text-slate-600">
                {l.name ?? "—"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {[l.locality, l.district].filter(Boolean).join(" – ") || "—"}
                </span>
              </p>
            </div>
            {/* Opportunity score chip */}
            <div
              className={cn(
                "flex shrink-0 flex-col items-center rounded-lg px-2 py-1 ring-1",
                tone.bg,
                tone.ring,
              )}
              title={`${labels.scoreTitle} · ${formatNumber(opp.comparables)} ${labels.comparables}`}
            >
              <span className={cn("text-base font-bold leading-none", tone.text)}>
                {opp.score}
              </span>
              <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                {labels.score}
              </span>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
            {l.layout && (
              <span className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                {l.layout}
              </span>
            )}
            {l.floorArea != null && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />
                {formatNumber(l.floorArea)} m²
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-end justify-between">
            <p className="text-[15px] font-bold text-slate-900">
              {l.price != null ? formatEUR(l.price) : "—"}
            </p>
            {l.pricePerSqm != null && (
              <p className="text-xs text-slate-400">
                {formatEUR(Math.round(l.pricePerSqm))}/m²
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Analytical footer */}
      <div className="mt-3 border-t border-slate-100 pt-2.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {labels.marketEstimate}{" "}
            <span className="font-semibold text-slate-700">
              {opp.marketEstimate != null ? formatEUR(opp.marketEstimate) : "—"}
            </span>
          </p>
          <p className={cn("flex items-center gap-1 text-xs font-semibold", diffTone)}>
            <ArrowDownRight
              className={cn("h-3.5 w-3.5", opp.position === "over" && "rotate-90")}
            />
            {diffLabel}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          <Metric
            icon={Wallet}
            label={labels.estRent}
            value={opp.estimatedRent != null ? formatEUR(opp.estimatedRent) : "—"}
          />
          <Metric
            icon={Percent}
            label={labels.grossYield}
            value={opp.grossYield != null ? `${opp.grossYield.toFixed(1)} %` : "—"}
            tone={
              opp.grossYield != null && opp.grossYield >= 4.5
                ? "text-emerald-600"
                : "text-slate-700"
            }
          />
          <Metric
            icon={ShieldCheck}
            label={labels.confidence}
            value={labels.conf[opp.confidence]}
            tone={
              opp.confidence === "High"
                ? "text-emerald-600"
                : opp.confidence === "Low"
                  ? "text-amber-600"
                  : "text-slate-700"
            }
          />
          <Metric
            icon={Clock}
            label={labels.onMarket}
            value={opp.daysOnMarket != null ? `${opp.daysOnMarket} d` : "—"}
            tone={
              opp.daysOnMarket != null && opp.daysOnMarket <= 14
                ? "text-emerald-600"
                : "text-slate-700"
            }
          />
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", tone.bar)}
          style={{ width: `${opp.score}%` }}
        />
      </div>
    </Link>
  )
}
