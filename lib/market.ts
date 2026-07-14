// Slovak market configuration: the 8 kraje with seed price levels used by the
// indicative estimator on /odhad. The €/m² figures are 2024 averages for
// housing derived from NBS statistics (via financer.sk, checked 2026-07-06) —
// illustrative anchors only, NOT a valuation model. They will be replaced by
// the Estima engine once SK listing data has accumulated (see data/README.md).

export interface Region {
  id: string
  /** Native name, shown as-is in both languages. */
  name: string
  /** Seed average price, EUR per m² of flat/housing space. */
  pricePerM2: number
}

export const REGIONS: Region[] = [
  { id: "ba", name: "Bratislavský kraj", pricePerM2: 3190 },
  { id: "ke", name: "Košický kraj", pricePerM2: 2102 },
  { id: "po", name: "Prešovský kraj", pricePerM2: 2062 },
  { id: "za", name: "Žilinský kraj", pricePerM2: 1800 },
  { id: "tn", name: "Trenčiansky kraj", pricePerM2: 1581 },
  { id: "bb", name: "Banskobystrický kraj", pricePerM2: 1538 },
  { id: "tt", name: "Trnavský kraj", pricePerM2: 1394 },
  { id: "nr", name: "Nitriansky kraj", pricePerM2: 1389 },
]

export type PropertyType = "flat" | "house"
export type Condition = "new" | "renovated" | "original"

// Coarse multipliers for the indicative estimate. Houses trade below flats per
// m² of usable area; condition spreads roughly ±15 % around the average stock.
const TYPE_FACTOR: Record<PropertyType, number> = { flat: 1.0, house: 0.85 }
const CONDITION_FACTOR: Record<Condition, number> = {
  new: 1.15,
  renovated: 1.0,
  original: 0.85,
}

/** Half-width of the indicative range around the point estimate. */
const RANGE = 0.12

export interface Estimate {
  mid: number
  low: number
  high: number
  pricePerM2: number
}

export function estimatePrice(
  regionId: string,
  type: PropertyType,
  condition: Condition,
  areaM2: number,
): Estimate | null {
  const region = REGIONS.find((r) => r.id === regionId)
  if (!region || areaM2 <= 0) return null
  const perM2 = region.pricePerM2 * TYPE_FACTOR[type] * CONDITION_FACTOR[condition]
  const mid = perM2 * areaM2
  return {
    mid: Math.round(mid),
    low: Math.round(mid * (1 - RANGE)),
    high: Math.round(mid * (1 + RANGE)),
    pricePerM2: Math.round(perM2),
  }
}
