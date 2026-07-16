"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  MapPin,
  Home,
  Maximize2,
  LandPlot,
  Coins,
  Building2,
  Calendar,
  Clock,
  Heart,
  Share2,
  ExternalLink,
  FileDown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Info,
  Check,
  Maximize,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  fetchAllListings,
  fetchPropertyReportPdf,
  type Listing,
} from "@/lib/api"
import { formatEUR, formatNumber, cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { isSaved, toggleSaved, onSavedChange } from "@/lib/saved"
import Gallery from "@/components/Gallery"

// Leaflet touches `window` at import time, so load the map client-side only.
const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => <div className="h-[440px] w-full bg-slate-100 animate-pulse" />,
})

// Bazoš gives us okres/kraj directly, so the comparable-area label is simply
// the listing's district (falling back to region, then the whole country).
function areaLabel(l: Pick<Listing, "district" | "region">): string {
  return l.district ?? (l.region ? `${l.region} kraj` : "SR")
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function daysBetween(iso: string | null, end: Date): number | null {
  if (!iso) return null
  const start = new Date(iso)
  if (isNaN(start.getTime())) return null
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000))
}

// Always derive €/m² from price ÷ usable area so it stays consistent with the
// price and area shown beside it; fall back to the stored value if either is
// missing.
function ppsmOf(l: Pick<Listing, "price" | "floorArea" | "pricePerSqm">): number | null {
  if (l.price != null && l.floorArea) return l.price / l.floorArea
  return l.pricePerSqm
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { t, lang } = useI18n()
  const id = decodeURIComponent(params.id)

  const [all, setAll] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [saved, setSaved] = useState(false)
  const [shared, setShared] = useState(false)
  const [sent, setSent] = useState(false)
  const [mapExpanded, setMapExpanded] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  // localStorage is client-only — read after mount and follow global toggles.
  useEffect(() => {
    setSaved(isSaved(id))
    return onSavedChange(() => setSaved(isSaved(id)))
  }, [id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        // `active: undefined` overrides the active-only default: a deep link
        // to a deactivated listing should still render (marked inactive), not 404.
        const data = await fetchAllListings({ active: undefined })
        if (!cancelled) setAll(data.items)
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load listing.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const listing = useMemo(() => all.find((l) => l.id === id) ?? null, [all, id])

  // Close the expanded map on Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!mapExpanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMapExpanded(false)
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [mapExpanded])

  // Market position: where this listing's €/m² sits vs. comparable listings.
  // Comparables = same layout (fallback: same okres, fallback: whole set).
  const market = useMemo(() => {
    if (!listing) return null
    const listingPps = ppsmOf(listing)
    if (listingPps == null) return null
    const area = areaLabel(listing)
    const byLayout = all.filter(
      (l) => ppsmOf(l) != null && l.layout && l.layout === listing.layout,
    )
    const byDistrict = all.filter(
      (l) => ppsmOf(l) != null && l.district && l.district === listing.district,
    )
    const pool =
      byLayout.length >= 4 ? byLayout : byDistrict.length >= 4 ? byDistrict : all
    const med = median(
      pool.map((l) => ppsmOf(l)).filter((v): v is number => v != null),
    )
    if (!med) return null
    const ratio = listingPps / med
    // Map ratio 0.75 → 0% (great) … 1.25 → 100% (premium), clamped.
    const pct = Math.min(100, Math.max(0, ((ratio - 0.75) / 0.5) * 100))
    const tier: "great" | "average" | "premium" =
      ratio < 0.95 ? "great" : ratio <= 1.08 ? "average" : "premium"
    return { pct, tier, area, med }
  }, [all, listing])

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(lang === "sk" ? "sk-SK" : "en-GB", { dateStyle: "long" }),
    [lang],
  )

  function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (navigator.share) {
      navigator.share({ title: listing?.name ?? "Listing", url }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {})
      setShared(true)
      setTimeout(() => setShared(false), 1800)
    }
  }

  // Generate the valuation PDF (backend renders it), then hand the user a
  // download with a sensible filename. Blob download keeps the raw API URL out
  // of the address bar and lets us surface a clear message if the backend is
  // unavailable (e.g. the PDF engine returned 503).
  async function onExportReport() {
    if (reportLoading) return
    setReportLoading(true)
    setReportError(null)
    try {
      const blob = await fetchPropertyReportPdf(id, lang)
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = `estima-report-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setReportError(t("property.reportError"))
      setTimeout(() => setReportError(null), 4000)
    } finally {
      setReportLoading(false)
    }
  }

  // ── Loading / error / not-found ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-5 w-32 bg-slate-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-9 w-2/3 bg-slate-100 rounded animate-pulse" />
            <div className="aspect-[16/10] bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
          <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <Home className="h-8 w-8 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900">{t("property.notFound")}</h1>
        <p className="text-sm text-slate-500 mt-2">
          {error ?? t("property.notFoundSub")}
        </p>
        <Link
          href="/inzeraty"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("property.back")}
        </Link>
      </div>
    )
  }

  const isRent = listing.dealType === "rent"
  const trackedDays = daysBetween(listing.firstSeenAt, new Date())
  const trackedLabel =
    trackedDays != null
      ? trackedDays === 1
        ? t("property.day", { n: 1 })
        : t("property.days", { n: trackedDays })
      : null

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Back */}
      <Link
        href="/inzeraty"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("property.back")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main column ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + price + market position */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-emerald-700 hover:bg-emerald-700">
                  {isRent ? t("property.forRent") : t("property.forSale")}
                </Badge>
                {listing.category && (
                  <Badge variant="secondary" className="uppercase tracking-wide">
                    {listing.category}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
                {listing.name ?? t("listings.untitled")}
              </h1>
              {listing.locality && (
                <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-2">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  {listing.locality}
                  {listing.region ? ` · ${listing.region} kraj` : ""}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
                {listing.firstSeenAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("property.listed")} {dateFmt.format(new Date(listing.firstSeenAt))}
                  </span>
                )}
                {trackedLabel && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {t("property.onPortal")} {trackedLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 lg:text-right">
              <p className="text-3xl font-bold text-slate-900 tabular-nums">
                {listing.price != null ? formatEUR(listing.price) : t("listings.priceNa")}
                {isRent && listing.price != null && (
                  <span className="text-base font-medium text-slate-400">
                    {" "}
                    {t("listings.perMonth")}
                  </span>
                )}
              </p>
              {ppsmOf(listing) != null && (
                <p className="text-sm text-slate-500 mt-0.5 tabular-nums">
                  {formatEUR(Math.round(ppsmOf(listing)!))} /m²
                </p>
              )}
            </div>
          </div>

          {/* Market position bar */}
          {market && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {t("property.marketPosition")}
                  </p>
                  <Info className="h-3.5 w-3.5 text-slate-300" />
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {t("property.comparedTo", { area: market.area })}
                </p>
                <div className="relative h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-[3px] border-white bg-slate-900 shadow-md"
                    style={{ left: `${market.pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2.5 text-xs">
                  <span className={cn("font-semibold", market.tier === "great" ? "text-emerald-700" : "text-slate-400")}>
                    {t("property.greatPrice")}
                  </span>
                  <span className={cn("font-medium", market.tier === "average" ? "text-amber-600" : "text-slate-400")}>
                    {t("property.marketAverage")}
                  </span>
                  <span className={cn("font-semibold", market.tier === "premium" ? "text-rose-600" : "text-slate-400")}>
                    {t("property.premium")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => toggleSaved(id)}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
              {saved ? t("property.saved") : t("property.save")}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              {shared ? t("property.copied") : t("property.share")}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-700 hover:bg-emerald-800"
              onClick={onExportReport}
              disabled={reportLoading}
            >
              {reportLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {reportLoading ? t("property.reportGenerating") : t("property.exportReport")}
            </Button>
            {reportError && (
              <span className="text-xs text-rose-600">{reportError}</span>
            )}
          </div>

          {/* Gallery */}
          <Gallery
            images={listing.images?.length ? listing.images : listing.imageUrl ? [listing.imageUrl] : []}
            alt={listing.name ?? "Listing"}
            sourceUrl={listing.url}
            moreLabel={t("property.morePhotos")}
          />

          {/* Spec strip */}
          <Card>
            <CardContent className="p-0">
              <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-slate-100">
                <Spec icon={Coins} label={t("property.pricePerSqm")} value={ppsmOf(listing) != null ? `${formatEUR(Math.round(ppsmOf(listing)!))}/m²` : "—"} />
                <Spec icon={Home} label={t("property.type")} value={listing.category ?? "—"} />
                <Spec icon={Building2} label={t("property.layout")} value={listing.layout ?? "—"} />
                <Spec icon={Maximize2} label={t("property.usableArea")} value={listing.floorArea != null ? `${formatNumber(listing.floorArea)} m²` : "—"} />
                {listing.landArea != null && (
                  <Spec icon={LandPlot} label={t("property.landArea")} value={`${formatNumber(listing.landArea)} m²`} />
                )}
                <Spec icon={Calendar} label={t("property.firstSeen")} value={listing.firstSeenAt ? dateFmt.format(new Date(listing.firstSeenAt)) : "—"} />
                <Spec icon={ShieldCheck} label={t("property.status")} value={listing.active ? t("property.active") : t("property.inactive")} />
              </dl>
            </CardContent>
          </Card>

          {/* Location map */}
          {listing.lat != null && listing.lon != null && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                  {t("property.location")}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMapExpanded(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                  >
                    <Maximize className="h-3.5 w-3.5" />
                    {t("property.expandMap")}
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    {t("property.openInMaps")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3 -mt-1">{t("property.nearbyHint")}</p>
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <PropertyMap
                  lat={listing.lat}
                  lon={listing.lon}
                  label={listing.locality ?? listing.name ?? t("property.location")}
                  expanded={mapExpanded}
                  onExpand={() => setMapExpanded(true)}
                  onClose={() => setMapExpanded(false)}
                />
                <dl className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-100 bg-white border-t border-slate-100">
                  {listing.locality && (
                    <LocFact label={t("property.address")} value={listing.locality} />
                  )}
                  <LocFact label={t("property.latitude")} value={listing.lat.toFixed(6)} />
                  <LocFact label={t("property.longitude")} value={listing.lon.toFixed(6)} />
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Inquiry card */}
            <Card>
              <CardContent className="p-5">
                {sent ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-6 w-6 text-emerald-700" />
                    </div>
                    <p className="font-semibold text-slate-900">{t("property.inquirySent")}</p>
                    <p className="text-sm text-slate-500 mt-1">{t("property.inquirySentSub")}</p>
                  </div>
                ) : (
                  <>
                    <h2 className="font-semibold text-slate-900">{t("property.interested")}</h2>
                    <p className="text-sm text-slate-500 mt-1 mb-4">{t("property.inquirySub")}</p>
                    <form
                      className="space-y-2.5"
                      onSubmit={(e) => {
                        e.preventDefault()
                        setSent(true)
                      }}
                    >
                      <input
                        required
                        placeholder={t("property.yourName")}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2.5 px-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        required
                        type="email"
                        placeholder={t("property.emailAddress")}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2.5 px-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="tel"
                        placeholder={t("property.phoneNumber")}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2.5 px-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <textarea
                        rows={3}
                        defaultValue={t("property.messagePlaceholder")}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2.5 px-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      />
                      <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800">
                        {t("property.sendInquiry")}
                      </Button>
                    </form>
                    <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-3">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {t("property.dataSafe")}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Valuation teaser */}
            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  <h3 className="font-semibold text-slate-900">{t("property.valuationTitle")}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">{t("property.valuationSub")}</p>
                <Link href="/odhad">
                  <Button variant="outline" className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                    {t("property.runValuation")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Optional: original listing */}
            {listing.url && (
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors py-1"
              >
                {t("property.viewOriginal")}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-900 truncate" title={value}>
        {value}
      </p>
    </div>
  )
}

function LocFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 truncate" title={value}>
        {value}
      </p>
    </div>
  )
}
