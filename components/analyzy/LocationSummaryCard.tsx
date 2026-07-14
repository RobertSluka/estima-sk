"use client"

import { Train, ShoppingCart, GraduationCap, Trees, UtensilsCrossed } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import type { AmenityKind, LocationAmenity } from "@/lib/analyza"

const ICON: Record<AmenityKind, typeof Train> = {
  transport: Train,
  grocery: ShoppingCart,
  school: GraduationCap,
  park: Trees,
  restaurant: UtensilsCrossed,
}

export default function LocationSummaryCard({ amenities }: { amenities: LocationAmenity[] }) {
  const { t } = useI18n()
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">{t("analyses.location.title")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {amenities.map((a) => {
            const Icon = ICON[a.kind]
            return (
              <div key={a.kind} className="flex items-center gap-2.5">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 truncate">
                    {t(`analyses.location.${a.kind}`)}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">{a.distanceM} m</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
