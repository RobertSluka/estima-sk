"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import { formatEUR, formatNumber } from "@/lib/utils"
import {
  REGION_GROWTH,
  simulateBuyVsRent,
  type BuyVsRentInputs,
  type RegionGrowth,
} from "@/lib/buyVsRent"
import type { Listing } from "@/lib/api"

// Mirrors the backend's report assumptions (estima-sk-backend
// services/reports/buy_vs_rent.py) so this preview matches the PDF section.
const MORTGAGE_RATE_PCT = 4
const LTV_PCT = 80
const TERM_YEARS = 30
const INFLATION_PCT = 2.5
const INVESTMENT_RETURN_PCT = 5

const BUYER_COLOR = "#10b981"
const RENTER_COLOR = "var(--chart-ink)"
const RENTER_LINE = "#0f172a"

// Listing.region carries the kraj adjective → REGION_GROWTH key.
const KRAJ_TO_GROWTH_KEY: Record<string, RegionGrowth["key"]> = {
  Bratislavský: "ba",
  Trnavský: "tt",
  Trenčiansky: "tn",
  Nitriansky: "nr",
  Žilinský: "za",
  Banskobystrický: "bb",
  Prešovský: "po",
  Košický: "ke",
}

interface Props {
  listing: Listing
  /** Median €/m²/month of active rent listings in the listing's district. */
  rentMedianPerSqm: number | null
}

export default function BuyVsRentCard({ listing, rentMedianPerSqm }: Props) {
  const { t } = useI18n()

  const inputs = useMemo<BuyVsRentInputs | null>(() => {
    if (listing.dealType === "rent") return null
    if (listing.price == null || !listing.floorArea || !rentMedianPerSqm) return null
    const regionKey =
      (listing.region && KRAJ_TO_GROWTH_KEY[listing.region]) || "sk"
    const growth =
      REGION_GROWTH.find((r) => r.key === regionKey)?.growthPct ?? 7
    return {
      mode: "occupier",
      propertyPrice: listing.price,
      propertyGrowthPct: growth,
      monthlyRent: Math.round(rentMedianPerSqm * listing.floorArea),
      mortgageRatePct: MORTGAGE_RATE_PCT,
      ltvPct: LTV_PCT,
      termYears: TERM_YEARS,
      inflationPct: INFLATION_PCT,
      investmentReturnPct: INVESTMENT_RETURN_PCT,
      vacancyPct: 0,
      costsPct: 0,
      rentalTaxPct: 0,
    }
  }, [listing, rentMedianPerSqm])

  const result = useMemo(
    () => (inputs ? simulateBuyVsRent(inputs) : null),
    [inputs],
  )

  // Sale listings without a usable rent estimate simply skip the section —
  // same rule the backend applies to the PDF.
  if (!inputs || !result) return null

  const buyWins = result.buyerFinal >= result.renterFinal

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-slate-900">{t("analyses.bvr.title")}</h3>
        <p className="mt-0.5 text-xs text-slate-400">{t("analyses.bvr.subtitle")}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BUYER_COLOR }} />
            {t("buyRent.buyer")}:{" "}
            <span className="font-bold text-slate-900">{formatEUR(result.buyerFinal)}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: RENTER_COLOR }} />
            {t("buyRent.renter")}:{" "}
            <span className="font-bold text-slate-900">{formatEUR(result.renterFinal)}</span>
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              buyWins ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
            }`}
          >
            {buyWins ? t("buyRent.verdictBuy") : t("buyRent.verdictRent")}
          </span>
        </div>

        <div className="mt-3">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={result.points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 10, 20, 30]}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  Math.abs(v) >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}M`
                    : `${Math.round(v / 1000)}k`
                }
                width={44}
              />
              <Line type="monotone" dataKey="buyer" stroke={BUYER_COLOR} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="renter" stroke={RENTER_LINE} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          {t("analyses.bvr.assumptions", {
            rent: formatEUR(inputs.monthlyRent),
            district: listing.district ?? t("analyses.bvr.localMarket"),
            growth: formatNumber(inputs.propertyGrowthPct),
            region: listing.region ? `${listing.region} kraj` : "SR",
          })}
        </p>
      </CardContent>
    </Card>
  )
}
