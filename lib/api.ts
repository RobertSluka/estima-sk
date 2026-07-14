// ─── Backend API client ─────────────────────────────────────────────────────
// Talks to the read-only API in estima-sk-backend (src/read_api.py), which
// serves the live Slovak real-estate database (properties table, EUR prices,
// district = okres, region = kraj).
//
// Configure the base URL with NEXT_PUBLIC_API_URL (see .env.local).

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8011"

// Mirrors the JSON shape returned by GET /listings in src/read_api.py.
export interface Listing {
  id: string
  source: string
  sourceListingId: string
  dealType: "sale" | "rent" | null
  category: string | null
  name: string | null
  locality: string | null
  district: string | null // Slovak okres, e.g. "Košice"
  region: string | null // Slovak kraj, e.g. "Košický"
  layout: string | null // "3-izb"
  floorArea: number | null
  landArea: number | null
  price: number | null // EUR
  pricePerSqm: number | null // EUR/m²
  lat: number | null // town centroid — same-town listings stack; cluster on maps
  lon: number | null
  imageUrl: string | null
  images: string[]
  url: string | null
  active: boolean
  firstSeenAt: string | null
  lastSeenAt: string | null
}

export interface ListingsResponse {
  total: number
  limit: number
  offset: number
  items: Listing[]
}

export type DealId = "sale" | "rent"

export interface ListingsQuery {
  limit?: number
  offset?: number
  source?: string
  category?: string
  dealType?: DealId
  region?: string // kraj
  district?: string // okres
  active?: boolean
  minPrice?: number
  maxPrice?: number
}

export async function fetchListings(
  query: ListingsQuery = {},
): Promise<ListingsResponse> {
  const params = new URLSearchParams()
  if (query.limit != null) params.set("limit", String(query.limit))
  if (query.offset != null) params.set("offset", String(query.offset))
  if (query.source) params.set("source", query.source)
  if (query.category) params.set("category", query.category)
  if (query.dealType) params.set("deal_type", query.dealType)
  if (query.region) params.set("region", query.region)
  if (query.district) params.set("district", query.district)
  if (query.active != null) params.set("active", String(query.active))
  if (query.minPrice != null) params.set("min_price", String(query.minPrice))
  if (query.maxPrice != null) params.set("max_price", String(query.maxPrice))

  const res = await fetch(`${API_URL}/listings?${params.toString()}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Listings request failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// The read API caps `limit` at 500, so pull the full set in pages. The Slovak
// dataset is small enough (~hundreds of rows) to hold in memory and filter
// client-side — which also lets us filter on fields the API has no param for
// (layout, locality, area).
const MAX_PAGE = 500

export async function fetchAllListings(
  query: Omit<ListingsQuery, "limit" | "offset"> = {},
): Promise<{ total: number; items: Listing[] }> {
  // Only the live (active) listings by default — deactivated rows are stale.
  const base = { active: true, ...query }
  const first = await fetchListings({ ...base, limit: MAX_PAGE, offset: 0 })
  const items = [...first.items]
  let offset = items.length
  while (offset < first.total) {
    const page = await fetchListings({ ...base, limit: MAX_PAGE, offset })
    if (page.items.length === 0) break
    items.push(...page.items)
    offset += page.items.length
  }
  return { total: first.total, items }
}

// ─── Property-type buckets ───────────────────────────────────────────────────
// The backend stores canonical categories (apartment/house/land/commercial);
// bucket anything unknown to "other" so the UI never breaks on new values.

export type PropertyTypeId =
  | "apartments"
  | "houses"
  | "land"
  | "commercial"
  | "other"

export function categoryBucket(category: string | null): PropertyTypeId {
  const c = (category ?? "").toLowerCase().trim()
  if (/(byt|apart)/.test(c)) return "apartments"
  if (/(dom|house|chat|chalup|vila)/.test(c)) return "houses"
  if (/(pozem|land|parcel)/.test(c)) return "land"
  if (/(komerc|commerc|office|kancel|sklad)/.test(c)) return "commercial"
  return "other"
}

// ─── Slovak layout ordering ──────────────────────────────────────────────────
// Backend layouts are "1-izb", "1.5-izb", "2-izb", …; sort numerically with
// unknown values sinking to the end.
export function layoutRank(layout: string): number {
  const m = layout.match(/^(\d+(?:\.\d+)?)-izb/)
  return m ? parseFloat(m[1]) : 999
}

// ─── Estima market index (asking-price trends) ──────────────────────────────
// GET /market-index — daily median asking prices computed from our own listing
// snapshots. district here is the Slovak okres.

export interface MarketIndexPoint {
  date: string
  medianPrice: number | null
  medianPricePerSqm: number | null
  propertyCount: number
}

export interface MarketIndexSeries {
  dealType: DealId
  category: string
  district: string | null
  series: MarketIndexPoint[]
}

export interface MarketIndexDistrict {
  district: string
  propertyCount: number
}

export async function fetchMarketIndex(
  kind: DealId = "sale",
  district?: string,
  category: string = "apartment",
): Promise<MarketIndexSeries> {
  const params = new URLSearchParams({ deal_type: kind, category })
  if (district) params.set("district", district)
  const res = await fetch(`${API_URL}/market-index?${params.toString()}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Market index failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function fetchMarketIndexDistricts(
  kind: DealId = "sale",
  category: string = "apartment",
): Promise<MarketIndexDistrict[]> {
  const params = new URLSearchParams({ deal_type: kind, category })
  const res = await fetch(
    `${API_URL}/market-index/districts?${params.toString()}`,
    { cache: "no-store" },
  )
  if (!res.ok) {
    throw new Error(
      `Market index districts failed: ${res.status} ${res.statusText}`,
    )
  }
  const data = await res.json()
  return data.districts ?? []
}

// ─── Property valuation PDF report ──────────────────────────────────────────
// Served by GET /reports/properties/{id}/pdf in src/read_api.py. The endpoint
// streams application/pdf, so expose the URL (open in a new tab / href).
export function propertyReportPdfUrl(id: string, lang?: string): string {
  const base = `${API_URL}/reports/properties/${encodeURIComponent(id)}/pdf`
  // Backend renders 'en'/'cs' today; unknown values fall back to the default
  // language server-side, so passing the UI lang is always safe.
  return lang ? `${base}?lang=${encodeURIComponent(lang)}` : base
}

// Fetch the report as a Blob — for triggering a download with a chosen
// filename or opening a preview tab. Throws on non-200 so the caller can
// surface a message (404 = unknown property, 503 = PDF engine unavailable).
export async function fetchPropertyReportPdf(id: string, lang?: string): Promise<Blob> {
  const res = await fetch(propertyReportPdfUrl(id, lang), { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Report generation failed: ${res.status} ${res.statusText}`)
  }
  return res.blob()
}

// ─── Price drops ─────────────────────────────────────────────────────────────
// GET /price-drops — recent price reductions from the price_changes table.
// absoluteChange is negative; percentChange is the signed %.

export interface PriceDrop {
  id: string
  propertyId: string
  changedAt: string | null
  oldPrice: number
  newPrice: number
  absoluteChange: number
  percentChange: number | null
  source: string | null
  dealType: DealId | null
  category: string | null
  name: string | null
  locality: string | null
  district: string | null
  region: string | null
  layout: string | null
  floorArea: number | null
  imageUrl: string | null
  url: string | null
  currentPrice: number | null
  pricePerSqm: number | null
  active: boolean
}

export interface PriceDropsResponse {
  total: number
  limit: number
  offset: number
  items: PriceDrop[]
}

export async function fetchPriceDrops(query: {
  limit?: number
  offset?: number
  category?: string
  district?: string
  dealType?: DealId
  sinceDays?: number
} = {}): Promise<PriceDropsResponse> {
  const params = new URLSearchParams()
  if (query.limit != null) params.set("limit", String(query.limit))
  if (query.offset != null) params.set("offset", String(query.offset))
  if (query.category) params.set("category", query.category)
  if (query.district) params.set("district", query.district)
  if (query.dealType) params.set("deal_type", query.dealType)
  if (query.sinceDays != null) params.set("since_days", String(query.sinceDays))
  const res = await fetch(`${API_URL}/price-drops?${params.toString()}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Price drops failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}
