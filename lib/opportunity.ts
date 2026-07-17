// ─── Investment intelligence layer ──────────────────────────────────────────
// Scores every listing against its own market segment so the /prilezitosti
// feed can rank "where do I look first". Unlike byteval's mock layer, every
// metric here is computed from real data in the listing feed:
//
//   • market estimate / discount — median €/m² of the (deal type, okres,
//     category) group, the same math the OpportunitiesChart uses
//   • gross yield / est. rent    — median rent €/m² of the matching rent group
//   • days on market             — firstSeenAt
//   • price drop                 — the /price-drops endpoint
//
// Listings without enough comparables in their group are not scored at all —
// a discount against a median of two listings is noise, not an opportunity.

import { categoryBucket, type Listing } from "@/lib/api"

/** Minimum listings in a (deal type, okres, category) group for the group
 *  median to mean anything. Matches the chart's long-standing threshold. */
export const MIN_COMPARABLES = 4

/** The rent side is thinner, so the bar for a usable rent median is lower —
 *  a yield estimate from 3 real rents beats no estimate at all. */
export const MIN_RENT_COMPARABLES = 3

export type PricePosition = "below" | "fair" | "over"
export type Confidence = "High" | "Medium" | "Low"

export interface Opportunity {
  /** 0–100 investment attractiveness. */
  score: number
  /** Group-median-implied market value, EUR — null when price/area unknown. */
  marketEstimate: number | null
  /** Signed % vs. the group median €/m². Negative = priced below market. */
  diffPct: number
  position: PricePosition
  /** Median €/m² of the listing's comparison group. */
  groupMedianPpsm: number
  /** Size of the comparison group. */
  comparables: number
  /** Median-rent-implied achievable monthly rent, EUR — sale listings only. */
  estimatedRent: number | null
  /** Gross rental yield, % — sale listings only. */
  grossYield: number | null
  confidence: Confidence
  daysOnMarket: number | null
  /** Recent price drop, positive % — or null if none recorded. */
  priceDrop: number | null
}

/** A listing paired with its derived investment metrics. */
export interface OppListing {
  listing: Listing
  opp: Opportunity
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

const groupKey = (l: Listing) =>
  `${l.dealType}|${l.district}|${categoryBucket(l.category)}`

function daysOnMarket(firstSeenAt: string | null): number | null {
  if (!firstSeenAt) return null
  const seen = new Date(firstSeenAt).getTime()
  if (Number.isNaN(seen)) return null
  const days = Math.floor((Date.now() - seen) / 86_400_000)
  return days >= 0 ? days : null
}

export function positionFor(diffPct: number): PricePosition {
  if (diffPct <= -3) return "below"
  if (diffPct >= 3) return "over"
  return "fair"
}

// Confidence = how much real signal backs the numbers on the card.
function confidenceFor(l: Listing, comparables: number, hasYield: boolean): Confidence {
  let s = 0
  if (comparables >= 8) s += 2
  else if (comparables >= 6) s += 1
  if (l.lat != null && l.lon != null) s += 1
  if (l.images && l.images.length >= 3) s += 1
  if (l.floorArea != null) s += 1
  if (hasYield) s += 1
  if (s >= 4) return "High"
  if (s >= 2) return "Medium"
  return "Low"
}

/**
 * Score all listings that have a statistically usable comparison group.
 * `priceDrops` maps listing id → most recent drop in positive % (from
 * /price-drops); pass an empty map when the endpoint has nothing.
 */
export function buildOpportunities(
  listings: Listing[],
  priceDrops: Map<string, number> = new Map(),
): OppListing[] {
  // One pass to build the €/m² groups — both deal types, so the same map
  // yields sale medians (market value) and rent medians (yield).
  const groups = new Map<string, number[]>()
  for (const l of listings) {
    if (!l.dealType || !l.district) continue
    if (l.pricePerSqm == null || l.pricePerSqm <= 0) continue
    const key = groupKey(l)
    const arr = groups.get(key) ?? []
    arr.push(l.pricePerSqm)
    groups.set(key, arr)
  }
  const medians = new Map<string, { med: number; count: number }>()
  for (const [key, ppsms] of Array.from(groups.entries())) {
    medians.set(key, { med: median(ppsms), count: ppsms.length })
  }

  const out: OppListing[] = []
  for (const l of listings) {
    if (!l.dealType || !l.district) continue
    if (l.pricePerSqm == null || l.pricePerSqm <= 0) continue
    const group = medians.get(groupKey(l))
    if (!group || group.count < MIN_COMPARABLES) continue

    const diffPct = ((l.pricePerSqm - group.med) / group.med) * 100
    const marketEstimate =
      l.price != null
        ? Math.round(l.price / (1 + diffPct / 100))
        : l.floorArea != null
          ? Math.round(group.med * l.floorArea)
          : null

    // Yield: what the okres' real rent market pays for this category.
    let estimatedRent: number | null = null
    let grossYield: number | null = null
    if (l.dealType === "sale" && l.floorArea != null && l.price != null && l.price > 0) {
      const rentGroup = medians.get(
        `rent|${l.district}|${categoryBucket(l.category)}`,
      )
      if (rentGroup && rentGroup.count >= MIN_RENT_COMPARABLES) {
        estimatedRent = Math.round(rentGroup.med * l.floorArea)
        grossYield =
          Math.round(((estimatedRent * 12) / l.price) * 100 * 10) / 10
      }
    }

    const confidence = confidenceFor(l, group.count, grossYield != null)
    const priceDrop = priceDrops.get(l.id) ?? null

    // Score: rewards below-market pricing, strong yield, a recent price drop
    // and high confidence; penalises overpricing. Discounts are capped so a
    // single mispriced outlier can't pin the scale.
    let score = 50
    score += Math.max(-30, Math.min(30, -diffPct)) * 1.5
    // Yield contribution capped: double-digit yields in this dataset are
    // usually price outliers, not genuinely spectacular deals.
    if (grossYield != null) score += Math.max(-8, Math.min(16, (grossYield - 4) * 4))
    if (priceDrop != null) score += Math.min(10, priceDrop)
    score += confidence === "High" ? 6 : confidence === "Low" ? -6 : 0
    score = Math.max(1, Math.min(100, Math.round(score)))

    out.push({
      listing: l,
      opp: {
        score,
        marketEstimate,
        diffPct: Math.round(diffPct * 10) / 10,
        position: positionFor(diffPct),
        groupMedianPpsm: group.med,
        comparables: group.count,
        estimatedRent,
        grossYield,
        confidence,
        daysOnMarket: daysOnMarket(l.firstSeenAt),
        priceDrop,
      },
    })
  }
  return out
}

// ─── Sorting ────────────────────────────────────────────────────────────────

export type SortKey =
  | "opportunity"
  | "discount"
  | "yield"
  | "newest"
  | "drops"
  | "ppsmAsc"
  | "confidence"

const CONF_RANK: Record<Confidence, number> = { High: 3, Medium: 2, Low: 1 }

export function sortOpportunities(items: OppListing[], key: SortKey): OppListing[] {
  const out = [...items]
  switch (key) {
    case "discount":
      out.sort((a, b) => a.opp.diffPct - b.opp.diffPct) // most negative first
      break
    case "yield":
      out.sort((a, b) => (b.opp.grossYield ?? -1) - (a.opp.grossYield ?? -1))
      break
    case "newest":
      out.sort(
        (a, b) =>
          (a.opp.daysOnMarket ?? Infinity) - (b.opp.daysOnMarket ?? Infinity),
      )
      break
    case "drops":
      out.sort((a, b) => (b.opp.priceDrop ?? -1) - (a.opp.priceDrop ?? -1))
      break
    case "ppsmAsc":
      out.sort(
        (a, b) =>
          (a.listing.pricePerSqm ?? Infinity) -
          (b.listing.pricePerSqm ?? Infinity),
      )
      break
    case "confidence":
      out.sort(
        (a, b) =>
          CONF_RANK[b.opp.confidence] - CONF_RANK[a.opp.confidence] ||
          b.opp.score - a.opp.score,
      )
      break
    case "opportunity":
    default:
      // Ties (clamped 100s) rank by the bigger real discount.
      out.sort(
        (a, b) => b.opp.score - a.opp.score || a.opp.diffPct - b.opp.diffPct,
      )
      break
  }
  return out
}
