"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { FileText, Search, TrendingUp, FileDown, AlertCircle, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchAllListings, fetchPropertyReportPdf, type Listing } from "@/lib/api"
import { REGION_SERIES, type RegionKey } from "@/lib/nbs"
import { useI18n } from "@/lib/i18n"
import {
  buildAnalysis,
  comparableRow,
  listingStatus,
  pickSimilarComparables,
  type ReportStatus,
} from "@/lib/analyza"
import ListingAnalysisSidebar from "@/components/analyzy/ListingAnalysisSidebar"
import AnalysisReportPreview from "@/components/analyzy/AnalysisReportPreview"
import type { MarketComparison } from "@/components/analyzy/MarketComparisonCard"

// Client-ready valuation reports for live listings — the SK port of byteval's
// Analyses page: selector sidebar (tabs/filters/comparable toggles) on the
// left, the full report preview (value estimate, market comparison,
// comparables, photo/condition, location, PDF checklist) on the right.
// The market comparison is real data (live medians + the NBS index); the PDF
// is generated on demand by the backend (/reports/properties/{id}/pdf).

// Listing.region carries the kraj adjective ("Košický") → NBS series column.
const NBS_REGION_KEYS: Record<string, RegionKey> = {
  Bratislavský: "BA",
  Trnavský: "TT",
  Trenčiansky: "TN",
  Nitriansky: "NR",
  Žilinský: "ZA",
  Banskobystrický: "BB",
  Prešovský: "PO",
  Košický: "KE",
}

const NBS_LATEST = REGION_SERIES[REGION_SERIES.length - 1]

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

// Median €/m² over listings matching the given predicate (excluding the subject).
function medianPerSqm(items: Listing[], subject: Listing, match: (l: Listing) => boolean) {
  return median(
    items
      .filter((l) => l.id !== subject.id && l.pricePerSqm != null && match(l))
      .map((l) => l.pricePerSqm as number),
  )
}

// Every row is real: medians from live listings, the external index straight
// from the embedded NBS series — never a synthesized number.
function buildMarket(selected: Listing, items: Listing[], nbsLabel: string): MarketComparison {
  const sameDeal = (l: Listing) => l.dealType === selected.dealType
  const districtMedianPerSqm = medianPerSqm(
    items,
    selected,
    (l) => sameDeal(l) && l.district != null && l.district === selected.district,
  )
  const similarMedianPerSqm = medianPerSqm(
    items,
    selected,
    (l) =>
      sameDeal(l) &&
      l.district === selected.district &&
      l.layout != null &&
      l.layout === selected.layout,
  )

  // NBS is a sale-price index — omit it for rent listings (wrong unit/scale).
  const regionKey: RegionKey =
    (selected.region && NBS_REGION_KEYS[selected.region]) || "SR"
  const nbsPerSqm = selected.dealType === "rent" ? null : NBS_LATEST[regionKey]

  const selectedPerSqm = selected.pricePerSqm
  const diffPercentVsMarket =
    selectedPerSqm != null && districtMedianPerSqm != null && districtMedianPerSqm > 0
      ? ((selectedPerSqm - districtMedianPerSqm) / districtMedianPerSqm) * 100
      : null

  return {
    districtMedianPerSqm,
    similarMedianPerSqm,
    nbsPerSqm,
    nbsLabel,
    selectedPerSqm,
    diffPercentVsMarket,
  }
}

export default function AnalysesPage() {
  const { t, lang } = useI18n()

  const [listings, setListings] = useState<Listing[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listFailed, setListFailed] = useState(false)
  const [selected, setSelected] = useState<Listing | null>(null)

  // Real PDF export (backend). We keep a min visible duration so the
  // "Generating report…" state is perceptible even on a fast response.
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(false)
  const reportUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAllListings()
      .then(({ items }) => {
        if (cancelled) return
        setListings(items)
        // Auto-select the first priced listing so the report preview is immediate.
        if (items.length) setSelected(items.find((l) => l.price != null) ?? items[0])
      })
      .catch(() => {
        if (!cancelled) setListFailed(true)
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (reportUrlRef.current) URL.revokeObjectURL(reportUrlRef.current)
    }
  }, [])

  // Deterministic status per listing for the sidebar cards/filters.
  const statuses = useMemo<Record<string, ReportStatus>>(() => {
    const map: Record<string, ReportStatus> = {}
    for (const l of listings) map[l.id] = listingStatus(l)
    return map
  }, [listings])

  const analysis = useMemo(
    () => (selected ? buildAnalysis(selected) : null),
    [selected],
  )

  const market = useMemo(() => {
    if (!selected) return null
    const label = selected.region
      ? t("analyses.market.nbs", { region: `${selected.region} kraj` })
      : t("analyses.market.nbsNational")
    return buildMarket(selected, listings, label)
  }, [selected, listings, t])

  // ── Comparables: real listings, auto-picked with manual add/remove ─────────
  const byId = useMemo(() => {
    const m: Record<string, Listing> = {}
    for (const l of listings) m[l.id] = l
    return m
  }, [listings])

  // Ids of the auto-selected similar listings for the current property.
  const defaultComparableIds = useMemo(
    () => (selected ? pickSimilarComparables(selected, listings).map((l) => l.id) : []),
    [selected, listings],
  )

  // The working comparable set — seeded from the auto-pick, then user-editable.
  // Resets whenever the selected property (and thus its auto-pick) changes.
  const [comparableIds, setComparableIds] = useState<string[]>([])
  useEffect(() => {
    setComparableIds(defaultComparableIds)
  }, [defaultComparableIds])

  const addComparable = (l: Listing) =>
    setComparableIds((ids) => (ids.includes(l.id) ? ids : [...ids, l.id]))
  const removeComparable = (id: string) =>
    setComparableIds((ids) => ids.filter((x) => x !== id))

  const comparables = useMemo(
    () =>
      selected
        ? comparableIds
            .map((id) => byId[id])
            .filter(Boolean)
            .map((l) => comparableRow(selected, l))
        : [],
    [comparableIds, byId, selected],
  )
  const comparableIdSet = useMemo(() => new Set(comparableIds), [comparableIds])

  async function fetchBlobUrl(): Promise<string> {
    if (!selected) throw new Error("no selection")
    const blob = await fetchPropertyReportPdf(selected.id, lang)
    if (reportUrlRef.current) URL.revokeObjectURL(reportUrlRef.current)
    reportUrlRef.current = URL.createObjectURL(blob)
    return reportUrlRef.current
  }

  async function onGenerate() {
    if (!selected || generating) return
    setGenerating(true)
    setGenError(false)
    try {
      const [url] = await Promise.all([
        fetchBlobUrl(),
        new Promise((r) => setTimeout(r, 900)), // keep the loading state visible
      ])
      const a = document.createElement("a")
      a.href = url
      a.download = `estima-report-${selected.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      setGenError(true)
    } finally {
      setGenerating(false)
    }
  }

  // Inline PDF preview. A window.open(blobUrl) after the await is silently
  // dropped by popup blockers (the "preview does nothing" bug), so the PDF is
  // embedded in an in-page modal instead — immune to popup policy.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!previewUrl) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewUrl(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [previewUrl])

  async function onPreview() {
    if (!selected || generating) return
    setGenerating(true)
    setGenError(false)
    try {
      const url = await fetchBlobUrl()
      setPreviewUrl(url)
    } catch {
      setGenError(true)
    } finally {
      setGenerating(false)
    }
  }

  const hasListings = listLoading || listFailed || listings.length > 0

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t("analyses.title")}</h1>
        <p className="text-sm text-slate-500 mt-1">{t("analyses.subtitle")}</p>
      </div>

      {!hasListings ? (
        <NoListingsEmptyState />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: listing / report selector */}
          <div className="w-full lg:w-[360px] lg:shrink-0">
            <Card className="lg:sticky lg:top-6">
              <CardContent className="p-4">
                <ListingAnalysisSidebar
                  listings={listings}
                  statuses={statuses}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelected}
                  comparableIds={comparableIdSet}
                  onToggleComparable={(l) =>
                    comparableIdSet.has(l.id) ? removeComparable(l.id) : addComparable(l)
                  }
                  loading={listLoading}
                  failed={listFailed}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: report preview */}
          <div className="flex-1 min-w-0">
            {genError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {t("analyses.error")}
              </div>
            )}
            {selected && analysis && market ? (
              <AnalysisReportPreview
                listing={selected}
                analysis={analysis}
                market={market}
                comparables={comparables}
                onRemoveComparable={removeComparable}
                generating={generating}
                onGenerate={onGenerate}
                onPreview={onPreview}
                previewDisabled={generating}
              />
            ) : (
              <GettingStarted />
            )}
          </div>
        </div>
      )}

      {/* Inline PDF preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 sm:p-8"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
              <p className="text-sm font-semibold text-slate-900">
                {t("analyses.header.preview")}
              </p>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                aria-label={t("analyses.previewClose")}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe src={previewUrl} title="Estima report" className="h-full w-full flex-1" />
          </div>
        </div>
      )}
    </div>
  )
}

// Shown when the backend returns no listings to analyse.
function NoListingsEmptyState() {
  const { t } = useI18n()
  return (
    <Card>
      <CardContent className="py-16 flex flex-col items-center justify-center text-center px-8">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-slate-800 font-semibold mb-1">{t("analyses.noListingsTitle")}</p>
        <p className="text-sm text-slate-500 max-w-md mb-5">{t("analyses.noListingsText")}</p>
        <Button asChild variant="emerald" className="gap-1.5">
          <Link href="/inzeraty">
            <Search className="h-4 w-4" />
            {t("analyses.goToSearch")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Shown when listings exist but none is selected (3-step guidance).
function GettingStarted() {
  const { t } = useI18n()
  const steps = [
    { Icon: FileText, key: "1" },
    { Icon: TrendingUp, key: "2" },
    { Icon: FileDown, key: "3" },
  ]
  return (
    <Card>
      <CardContent className="py-14 px-8 text-center">
        <p className="text-slate-800 font-semibold mb-1">{t("analyses.startTitle")}</p>
        <p className="text-sm text-slate-500 mb-8">{t("analyses.startHint")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          {steps.map((s, i) => (
            <div key={s.key} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <s.Icon className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-800">{t(`analyses.step.${s.key}.title`)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t(`analyses.step.${s.key}.text`)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
