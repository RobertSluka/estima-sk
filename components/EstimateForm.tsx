"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n"
import { formatEUR } from "@/lib/utils"
import {
  REGIONS,
  SUBREGIONS,
  estimatePrice,
  type Condition,
  type PropertyType,
} from "@/lib/market"

// Sentinel for "no locality picked" — Radix Select can't use "" as a value.
const WHOLE_REGION = "all"

export default function EstimateForm() {
  const { t } = useI18n()
  const [regionId, setRegionId] = useState("ba")
  const [localityId, setLocalityId] = useState(WHOLE_REGION)
  const [type, setType] = useState<PropertyType>("flat")
  const [condition, setCondition] = useState<Condition>("renovated")
  const [area, setArea] = useState(65)

  const localities = SUBREGIONS[regionId] ?? []

  const estimate = useMemo(
    () =>
      estimatePrice(
        regionId,
        localityId === WHOLE_REGION ? null : localityId,
        type,
        condition,
        area,
      ),
    [regionId, localityId, type, condition, area],
  )

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t("estimate.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("estimate.region")}</Label>
              <Select
                value={regionId}
                onValueChange={(v) => {
                  setRegionId(v)
                  setLocalityId(WHOLE_REGION)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("estimate.locality")}</Label>
              <Select value={localityId} onValueChange={setLocalityId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WHOLE_REGION}>{t("estimate.wholeRegion")}</SelectItem>
                  {localities.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("estimate.type")}</Label>
              <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">{t("estimate.typeFlat")}</SelectItem>
                  <SelectItem value="house">{t("estimate.typeHouse")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("estimate.condition")}</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t("estimate.condNew")}</SelectItem>
                  <SelectItem value="renovated">{t("estimate.condRenovated")}</SelectItem>
                  <SelectItem value="original">{t("estimate.condOriginal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area" className="text-xs text-slate-500">
                {t("estimate.area")}
              </Label>
              <div className="relative">
                <Input
                  id="area"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={1}
                  value={area}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    setArea(Number.isFinite(v) ? v : 0)
                  }}
                  className="pr-9 text-sm"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                  m²
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {estimate && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("estimate.resultTitle")}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {formatEUR(estimate.low)} – {formatEUR(estimate.high)}
            </p>
            <p className="mt-1.5 text-sm text-slate-500">
              {formatEUR(estimate.pricePerM2)} {t("estimate.perM2")}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <p className="text-sm leading-relaxed text-slate-500">{t("estimate.disclaimer")}</p>
          <p className="mt-2 text-xs text-slate-400">{t("estimate.sourceNote")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
