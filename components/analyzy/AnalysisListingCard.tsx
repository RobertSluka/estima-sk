"use client"

import { MapPin, Plus, Minus } from "lucide-react"
import { formatEUR, formatNumber } from "@/lib/utils"
import type { Listing } from "@/lib/api"
import { resolvePricePerSqm, type ReportStatus } from "@/lib/analyza"
import { useI18n } from "@/lib/i18n"
import ReportStatusBadge from "./ReportStatusBadge"

interface Props {
  listing: Listing
  status: ReportStatus
  selected: boolean
  onSelect: () => void
  isComparable?: boolean
  canAddComparable?: boolean
  onToggleComparable?: () => void
}

// Compact selector card: title, locality, layout · area · price, €/m², status.
// When another property is selected, each other card also exposes an
// add/remove-as-comparable toggle (bottom-right).
export default function AnalysisListingCard({
  listing,
  status,
  selected,
  onSelect,
  isComparable = false,
  canAddComparable = false,
  onToggleComparable,
}: Props) {
  const { t } = useI18n()
  const ppsqm = resolvePricePerSqm(listing)
  const meta = [
    listing.layout,
    listing.floorArea ? `${formatNumber(listing.floorArea)} m²` : null,
    listing.price != null ? formatEUR(listing.price) : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const showToggle = canAddComparable && onToggleComparable

  return (
    <div
      className={`group relative rounded-lg border transition-colors ${
        selected
          ? "bg-emerald-50 border-emerald-200"
          : isComparable
            ? "border-emerald-200/70 bg-emerald-50/30"
            : "border-slate-200/70 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      <button onClick={onSelect} className="w-full text-left px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900 truncate">
            {listing.name ?? listing.locality ?? listing.id}
          </p>
          <ReportStatusBadge status={status} className="shrink-0 scale-90 origin-right" />
        </div>
        {(listing.district ?? listing.locality) && (
          <p className="mt-0.5 text-[11px] text-slate-400 truncate flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.district ?? listing.locality}
          </p>
        )}
        {meta && <p className="mt-1 text-[11px] text-slate-500 truncate">{meta}</p>}
        {ppsqm != null && (
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
            {formatNumber(Math.round(ppsqm))} €/m²
          </p>
        )}
      </button>

      {showToggle && (
        <button
          type="button"
          aria-label={isComparable ? t("analyses.comps.remove") : t("analyses.comps.add")}
          aria-pressed={isComparable}
          onClick={onToggleComparable}
          className={`absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
            isComparable
              ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
              : "border-slate-200 bg-white text-slate-400 hover:border-emerald-400 hover:text-emerald-600"
          }`}
        >
          {isComparable ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  )
}
