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
import { Home, PiggyBank, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { formatEUR } from "@/lib/utils"
import {
  HORIZON_YEARS,
  simulateBuyVsRent,
  type BuyVsRentInputs,
} from "@/lib/buyVsRent"

const BUYER_COLOR = "#10b981" // emerald-500
const RENTER_COLOR = "#0f172a" // slate-900
// Same ink, but as a CSS var for HTML chips so they follow dark mode.
const RENTER_CHIP = "var(--chart-ink)"

const DEFAULTS: BuyVsRentInputs = {
  propertyPrice: 250000,
  monthlyRent: 900,
  mortgageRatePct: 4.0,
  ltvPct: 80,
  termYears: 30,
  inflationPct: 2.5,
  investmentReturnPct: 5.0,
}

interface FieldDef {
  key: keyof BuyVsRentInputs
  labelKey: string
  suffix: string
  step: number
}

const CustomTooltip = ({
  active,
  payload,
  label,
  buyerLabel,
  renterLabel,
  yearLabel,
}: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: number
  buyerLabel: string
  renterLabel: string
  yearLabel: string
}) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2.5">
      <p className="text-xs font-medium text-slate-500 mb-1">
        {yearLabel} {label}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-bold text-slate-900">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5"
            style={{ backgroundColor: p.dataKey === "buyer" ? BUYER_COLOR : RENTER_CHIP }}
          />
          {p.dataKey === "buyer" ? buyerLabel : renterLabel}: {formatEUR(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function BuyVsRentCalculator() {
  const { t } = useI18n()
  const [inputs, setInputs] = useState<BuyVsRentInputs>(DEFAULTS)

  const fields: FieldDef[] = [
    { key: "propertyPrice", labelKey: "buyRent.propertyPrice", suffix: "€", step: 5000 },
    { key: "monthlyRent", labelKey: "buyRent.monthlyRent", suffix: "€", step: 50 },
    { key: "mortgageRatePct", labelKey: "buyRent.mortgageRate", suffix: "%", step: 0.1 },
    { key: "ltvPct", labelKey: "buyRent.ltv", suffix: "%", step: 5 },
    { key: "termYears", labelKey: "buyRent.termYears", suffix: t("buyRent.years"), step: 1 },
    { key: "inflationPct", labelKey: "buyRent.inflation", suffix: "%", step: 0.1 },
    { key: "investmentReturnPct", labelKey: "buyRent.investmentReturn", suffix: "%", step: 0.1 },
  ]

  const result = useMemo(() => simulateBuyVsRent(inputs), [inputs])
  const buyWins = result.buyerFinal >= result.renterFinal
  const margin = Math.abs(result.buyerFinal - result.renterFinal)

  function setField(key: keyof BuyVsRentInputs, raw: string) {
    const value = parseFloat(raw)
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(value) ? value : 0 }))
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t("buyRent.inputsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key} className="text-xs text-slate-500">
                  {t(f.labelKey)}
                </Label>
                <div className="relative">
                  <Input
                    id={f.key}
                    type="number"
                    inputMode="decimal"
                    step={f.step}
                    min={0}
                    value={inputs[f.key]}
                    onChange={(e) => setField(f.key, e.target.value)}
                    className="pr-9 text-sm"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                    {f.suffix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Home className="h-3.5 w-3.5" />
              {t("buyRent.monthlyPayment")}
            </div>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
              {formatEUR(result.monthlyPayment)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t("buyRent.downPayment")}: {formatEUR(result.downPayment)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <PiggyBank className="h-3.5 w-3.5" />
              {t("buyRent.finalWealth", { years: HORIZON_YEARS })}
            </div>
            <p className="mt-1.5 text-sm text-slate-700">
              <span
                className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: BUYER_COLOR }}
              />
              {t("buyRent.buyer")}:{" "}
              <span className="font-bold text-slate-900">{formatEUR(result.buyerFinal)}</span>
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <span
                className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: RENTER_CHIP }}
              />
              {t("buyRent.renter")}:{" "}
              <span className="font-bold text-slate-900">{formatEUR(result.renterFinal)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className={buyWins ? "border-emerald-200 bg-emerald-50/50" : "border-slate-300 bg-slate-50"}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("buyRent.verdictTitle")}
            </div>
            <p className="mt-1.5 text-sm font-bold text-slate-900">
              {buyWins ? t("buyRent.verdictBuy") : t("buyRent.verdictRent")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t("buyRent.verdictBy", { amount: formatEUR(margin), years: HORIZON_YEARS })}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {result.breakevenYear !== null
                ? t("buyRent.breakeven", { year: result.breakevenYear })
                : t("buyRent.noBreakeven")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wealth chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t("buyRent.chartTitle", { years: HORIZON_YEARS })}</CardTitle>
          <p className="text-xs text-slate-400">{t("buyRent.chartSubtitle")}</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={result.points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  Math.abs(v) >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`
                }
                width={44}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    buyerLabel={t("buyRent.buyer")}
                    renterLabel={t("buyRent.renter")}
                    yearLabel={t("buyRent.year")}
                  />
                }
              />
              {/* No mount animation: values recompute on every keystroke. */}
              <Line
                type="monotone"
                dataKey="buyer"
                stroke={BUYER_COLOR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="renter"
                stroke={RENTER_COLOR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-3 flex flex-wrap justify-center gap-4">
            {[
              { label: t("buyRent.buyer"), color: BUYER_COLOR },
              { label: t("buyRent.renter"), color: RENTER_CHIP },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
