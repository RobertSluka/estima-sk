// Deterministic on-screen analysis derived from a real Listing — the SK port
// of byteval's lib/analysisMock.ts.
//
// The backend renders the *real* client PDF (/reports/properties/{id}/pdf);
// this module only powers the report-preview dashboard until the
// corresponding analysis endpoints exist. Everything is derived
// deterministically from the listing id/price so a given listing always shows
// the same numbers (stable across reloads and language switches). The market
// comparison is NOT here — the page computes it from real medians + NBS
// (see app/analyzy/page.tsx), never synthesized.

import type { Listing } from "@/lib/api"

export type ReportStatus =
  | "not_analysed"
  | "ready"
  | "missing_data"
  | "pdf_generated"
  | "outdated_price"

export type ValueSignal = "under" | "fair" | "above"

export interface ValueEstimate {
  estimatedMin: number
  estimatedMax: number
  estimatedMedian: number
  listingPrice: number | null
  diffPercent: number // listing price vs. estimated median
  signal: ValueSignal
}

export interface ComparableRow {
  id: string
  address: string
  layout: string
  area: number
  price: number
  pricePerSqm: number
  diffPercent: number // vs. selected listing €/m²
  /** Source-portal URL — SK has no listing-detail route, rows link out. */
  url: string | null
}

export type ConditionLevel = "high" | "good" | "average" | "low"

export interface PhotoCondition {
  imageUrls: string[]
  interiorCondition: ConditionLevel
  renovationLevel: "modernized" | "renovated" | "original"
  photoQuality: ConditionLevel
  missingRoom: string | null // token → i18n, null when nothing flagged
  lowPhotoRisk: boolean
}

export type AmenityKind =
  | "transport"
  | "grocery"
  | "school"
  | "park"
  | "restaurant"

export interface LocationAmenity {
  kind: AmenityKind
  distanceM: number
}

export interface ListingAnalysis {
  status: ReportStatus
  pricePerSqm: number | null
  lastUpdated: string | null
  value: ValueEstimate
  photo: PhotoCondition
  location: LocationAmenity[]
}

// ─── Deterministic helpers ──────────────────────────────────────────────────

// FNV-1a — small, stable, dependency-free.
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length]
}

// A stable pseudo-random in [min, max] from a seed.
function seededRange(seed: number, min: number, max: number): number {
  const frac = (seed % 1000) / 1000
  return min + frac * (max - min)
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}

// A "nice" rounding step ~1% of the magnitude, snapped to 1/2/5×10ⁿ — so
// rentals (hundreds of €) don't collapse onto the same rounded number a fixed
// step sized for sale prices would produce.
function niceStep(value: number): number {
  const v = Math.abs(value)
  if (v <= 0) return 1
  const raw = v * 0.01
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const snapped = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10
  return snapped * mag
}

// ─── Derivation ─────────────────────────────────────────────────────────────

export function resolvePricePerSqm(listing: Listing): number | null {
  if (listing.pricePerSqm != null) return listing.pricePerSqm
  if (listing.price != null && listing.floorArea) {
    return Math.round(listing.price / listing.floorArea)
  }
  return null
}

// ─── Comparables (real listings) ────────────────────────────────────────────

// Turn a real listing into a comparable row, with its €/m² diff vs. the
// selected property.
export function comparableRow(selected: Listing, listing: Listing): ComparableRow {
  const selPps = resolvePricePerSqm(selected)
  const pps = resolvePricePerSqm(listing) ?? 0
  return {
    id: listing.id,
    address: listing.name ?? listing.locality ?? listing.district ?? listing.id,
    layout: listing.layout ?? "—",
    area: listing.floorArea ?? 0,
    price: listing.price ?? 0,
    pricePerSqm: pps,
    diffPercent: selPps ? ((pps - selPps) / selPps) * 100 : 0,
    url: listing.url,
  }
}

// Auto-pick the most similar real listings from the loaded pool: same deal
// type is required, same okres and layout are strongly preferred, then
// nearest €/m². Excludes the selected listing and anything unpriced.
export function pickSimilarComparables(
  selected: Listing,
  pool: Listing[],
  count = 4,
): Listing[] {
  const selPps = resolvePricePerSqm(selected)
  const candidates = pool.filter(
    (l) =>
      l.id !== selected.id &&
      l.dealType === selected.dealType &&
      l.price != null &&
      resolvePricePerSqm(l) != null,
  )
  const score = (l: Listing): number => {
    let s = 0
    if (selected.district && l.district === selected.district) s -= 1000
    if (selected.layout && l.layout === selected.layout) s -= 500
    if (selPps != null) s += Math.abs(resolvePricePerSqm(l)! - selPps) / selPps
    return s
  }
  return [...candidates].sort((a, b) => score(a) - score(b)).slice(0, count)
}

function deriveStatus(listing: Listing, seed: number, ppsqm: number | null): ReportStatus {
  // Data completeness first — a listing missing price/area can't be valued.
  if (listing.price == null || ppsqm == null) return "missing_data"
  // Otherwise spread deterministically across the "analysed" states.
  return pick<ReportStatus>(
    ["ready", "ready", "pdf_generated", "outdated_price", "not_analysed"],
    seed,
  )
}

// Cheap status-only derivation for the sidebar list (avoids building the full
// analysis for every row). Must stay consistent with buildAnalysis().
export function listingStatus(listing: Listing): ReportStatus {
  const seed = hash(listing.id || listing.sourceListingId || "estima")
  return deriveStatus(listing, seed, resolvePricePerSqm(listing))
}

export function buildAnalysis(listing: Listing): ListingAnalysis {
  const seed = hash(listing.id || listing.sourceListingId || "estima")
  const ppsqm = resolvePricePerSqm(listing)
  const status = deriveStatus(listing, seed, ppsqm)
  const price = listing.price

  // ── Value estimate (built around the listing price so the signal reads
  //    naturally against it) ────────────────────────────────────────────────
  const centerFactor = pick([1.06, 1.02, 1.0, 0.97, 0.93], seed >> 2)
  const median = price != null ? roundTo(price * centerFactor, niceStep(price)) : 0
  const estimatedMin = roundTo(median * 0.97, niceStep(median))
  const estimatedMax = roundTo(median * 1.03, niceStep(median))
  const diffPercent =
    price != null && median > 0 ? ((price - median) / median) * 100 : 0
  const signal: ValueSignal =
    diffPercent > 3 ? "above" : diffPercent < -3 ? "under" : "fair"

  // ── Photo / condition (mock AI notes) ─────────────────────────────────────
  const imageUrls = listing.images?.length
    ? listing.images
    : listing.imageUrl
      ? [listing.imageUrl]
      : []
  // We can't actually inspect the photos, so only flag a possibly-missing room
  // when the gallery is sparse enough that the claim is plausible — otherwise
  // it contradicts the (often comprehensive) images shown below.
  const sparsePhotos = imageUrls.length < 3
  const photo: PhotoCondition = {
    imageUrls,
    interiorCondition: pick<ConditionLevel>(["good", "high", "average"], seed >> 1),
    renovationLevel: pick(["modernized", "renovated", "original"] as const, seed >> 4),
    photoQuality: pick<ConditionLevel>(["high", "good", "average"], seed >> 6),
    missingRoom: sparsePhotos ? pick(["bathroom", "kitchen", null] as const, seed >> 7) : null,
    lowPhotoRisk: sparsePhotos,
  }

  // ── Location amenities (mock distances) ───────────────────────────────────
  const location: LocationAmenity[] = [
    { kind: "transport", distanceM: roundTo(seededRange(seed, 200, 700), 10) },
    { kind: "grocery", distanceM: roundTo(seededRange(seed >> 2, 150, 500), 10) },
    { kind: "school", distanceM: roundTo(seededRange(seed >> 4, 400, 900), 10) },
    { kind: "park", distanceM: roundTo(seededRange(seed >> 6, 300, 1100), 10) },
    { kind: "restaurant", distanceM: roundTo(seededRange(seed >> 8, 100, 450), 10) },
  ]

  return {
    status,
    pricePerSqm: ppsqm,
    lastUpdated: listing.lastSeenAt ?? listing.firstSeenAt,
    value: {
      estimatedMin,
      estimatedMax,
      estimatedMedian: median,
      listingPrice: price,
      diffPercent,
      signal,
    },
    photo,
    location,
  }
}
