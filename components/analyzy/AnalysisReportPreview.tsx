"use client"

import { useState } from "react"
import Link from "next/link"
import {
  MapPin,
  FileDown,
  Eye,
  SlidersHorizontal,
  Loader2,
  Layers,
  Ruler,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatEUR, formatNumber } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import type { Listing } from "@/lib/api"
import type { ComparableRow, ListingAnalysis } from "@/lib/analyza"
import ReportStatusBadge from "./ReportStatusBadge"
import ValueEstimateCard from "./ValueEstimateCard"
import MarketComparisonCard, { type MarketComparison } from "./MarketComparisonCard"
import ComparableListingsTable from "./ComparableListingsTable"
import PhotoConditionPanel from "./PhotoConditionPanel"
import LocationSummaryCard from "./LocationSummaryCard"
import PdfSectionsChecklist from "./PdfSectionsChecklist"

interface Props {
  listing: Listing
  analysis: ListingAnalysis
  /** Real market context (live medians + NBS) computed by the page. */
  market: MarketComparison
  comparables: ComparableRow[]
  onRemoveComparable: (id: string) => void
  generating: boolean
  onGenerate: () => void
  onPreview: () => void
  previewDisabled: boolean
}

function fmtDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("sk-SK")
}

export default function AnalysisReportPreview({
  listing,
  analysis,
  market,
  comparables,
  onRemoveComparable,
  generating,
  onGenerate,
  onPreview,
  previewDisabled,
}: Props) {
  const { t } = useI18n()
  const [showAssumptions, setShowAssumptions] = useState(false)
  const updated = fmtDate(analysis.lastUpdated)

  const meta = [
    listing.layout && { Icon: Layers, text: listing.layout },
    listing.floorArea && { Icon: Ruler, text: `${formatNumber(listing.floorArea)} m²` },
  ].filter(Boolean) as { Icon: typeof Layers; text: string }[]

  const photo = listing.imageUrl ?? listing.images[0] ?? null
  const extraPhotos = Math.max(0, listing.images.length - 1)

  return (
    <div className="space-y-4">
      {/* A. Property header — with the actual listing: photo + links to the
          in-app detail and the original ad. */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {photo && (
              <Link
                href={`/inzeraty/${encodeURIComponent(listing.id)}`}
                className="relative block h-32 w-full sm:h-28 sm:w-40 lg:h-32 lg:w-48 shrink-0 overflow-hidden rounded-xl border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={listing.name ?? ""}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  loading="lazy"
                />
                {extraPhotos > 0 && (
                  <span className="absolute bottom-1.5 right-1.5 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {t("analyses.header.morePhotos", { n: extraPhotos })}
                  </span>
                )}
              </Link>
            )}
            <div className="min-w-0 flex-1">
              {/* Title row: name + status left, primary actions right */}
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 truncate">
                    {listing.name ?? listing.locality ?? listing.id}
                  </h2>
                  <ReportStatusBadge status={analysis.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAssumptions((v) => !v)}>
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {t("analyses.header.editAssumptions")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={previewDisabled}
                    onClick={onPreview}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {t("analyses.header.preview")}
                  </Button>
                  <Button variant="emerald" size="sm" className="gap-1.5" disabled={generating} onClick={onGenerate}>
                    {generating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileDown className="h-3.5 w-3.5" />
                    )}
                    {generating ? t("analyses.generating") : t("analyses.header.generatePdf")}
                  </Button>
                </div>
              </div>
              {(listing.district ?? listing.locality) && (
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {[listing.locality, listing.district, listing.region ? `${listing.region} kraj` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                {meta.map((m, i) => (
                  <span key={i} className="text-sm text-slate-600 flex items-center gap-1.5">
                    <m.Icon className="h-3.5 w-3.5 text-slate-400" />
                    {m.text}
                  </span>
                ))}
                {listing.price != null && (
                  <span className="text-sm font-semibold text-slate-900">
                    {formatEUR(listing.price)}
                  </span>
                )}
                {analysis.pricePerSqm != null && (
                  <span className="text-sm text-slate-500">
                    {formatNumber(Math.round(analysis.pricePerSqm))} €/m²
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <Link
                  href={`/inzeraty/${encodeURIComponent(listing.id)}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {t("analyses.header.viewListing")}
                </Link>
                {listing.url && (
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    {t("analyses.header.sourceAd")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {updated && (
                <p className="mt-2 text-[11px] text-slate-400">
                  {t("analyses.header.updated", { date: updated })}
                </p>
              )}
            </div>
          </div>

          {showAssumptions && (
            <p className="mt-4 rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-500">
              {t("analyses.header.assumptionsHint")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* B + C */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ValueEstimateCard value={analysis.value} />
        <MarketComparisonCard market={market} />
      </div>

      {/* D */}
      <ComparableListingsTable rows={comparables} onRemove={onRemoveComparable} />

      {/* E + F */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PhotoConditionPanel photo={analysis.photo} />
        <LocationSummaryCard amenities={analysis.location} />
      </div>

      {/* G */}
      <PdfSectionsChecklist exporting={generating} onExport={onGenerate} />
    </div>
  )
}
