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

// Localities within a kraj — the krajské mesto for every kraj plus city parts
// and hinterland okresy where the spread inside the kraj is largest (Bratislava,
// Košice). A kraj-wide average hides that spread (Staré Mesto vs Vrakuňa), which
// is exactly what users complained about.
//
// Anchors: krajské mestá are older-3-room-flat asking prices from the Realitná
// únia SR Realitný barometer, June 2026. Bratislava city parts are scaled from
// the Bratislava anchor with ratios calibrated on portal part-level averages
// (PLAN Real, March 2026: Staré Mesto ≈1.16×, Ružinov ≈1.05×, Petržalka ≈0.97×
// the city average); the remaining parts/okresy use the long-stable relative
// price structure of the city and are approximate. Indicative anchors only —
// NOT a valuation model.

export interface SubRegion {
  id: string
  /** Native name, shown as-is in both languages. */
  name: string
  /** Seed average price, EUR per m² of flat space. */
  pricePerM2: number
}

export const SUBREGIONS: Record<string, SubRegion[]> = {
  ba: [
    { id: "ba-stare-mesto", name: "BA – Staré Mesto", pricePerM2: 4560 },
    { id: "ba-nove-mesto", name: "BA – Nové Mesto", pricePerM2: 4250 },
    { id: "ba-ruzinov", name: "BA – Ružinov", pricePerM2: 4130 },
    { id: "ba-karlova-ves", name: "BA – Karlova Ves", pricePerM2: 4050 },
    { id: "ba-vajnory", name: "BA – Vajnory", pricePerM2: 3950 },
    { id: "ba-petrzalka", name: "BA – Petržalka", pricePerM2: 3815 },
    { id: "ba-raca", name: "BA – Rača", pricePerM2: 3750 },
    { id: "ba-lamac", name: "BA – Lamač", pricePerM2: 3750 },
    { id: "ba-zahorska-bystrica", name: "BA – Záhorská Bystrica", pricePerM2: 3700 },
    { id: "ba-dubravka", name: "BA – Dúbravka", pricePerM2: 3650 },
    { id: "ba-devinska-nova-ves", name: "BA – Devínska Nová Ves", pricePerM2: 3350 },
    { id: "ba-podunajske-biskupice", name: "BA – Podunajské Biskupice", pricePerM2: 3350 },
    { id: "ba-vrakuna", name: "BA – Vrakuňa", pricePerM2: 3300 },
    { id: "ba-okres-pezinok", name: "okres Pezinok", pricePerM2: 2950 },
    { id: "ba-okres-senec", name: "okres Senec", pricePerM2: 2950 },
    { id: "ba-okres-malacky", name: "okres Malacky", pricePerM2: 2500 },
  ],
  ke: [
    { id: "ke-mesto", name: "Košice – mesto", pricePerM2: 3340 },
    { id: "ke-okolie", name: "okres Košice-okolie", pricePerM2: 2250 },
  ],
  po: [{ id: "po-mesto", name: "Prešov – mesto", pricePerM2: 2603 }],
  za: [{ id: "za-mesto", name: "Žilina – mesto", pricePerM2: 2925 }],
  tn: [{ id: "tn-mesto", name: "Trenčín – mesto", pricePerM2: 2337 }],
  bb: [{ id: "bb-mesto", name: "Banská Bystrica – mesto", pricePerM2: 2814 }],
  tt: [{ id: "tt-mesto", name: "Trnava – mesto", pricePerM2: 2859 }],
  nr: [{ id: "nr-mesto", name: "Nitra – mesto", pricePerM2: 2437 }],
}

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
  localityId: string | null,
  type: PropertyType,
  condition: Condition,
  areaM2: number,
): Estimate | null {
  const region = REGIONS.find((r) => r.id === regionId)
  if (!region || areaM2 <= 0) return null
  const locality = localityId
    ? SUBREGIONS[regionId]?.find((s) => s.id === localityId)
    : undefined
  const base = locality?.pricePerM2 ?? region.pricePerM2
  const perM2 = base * TYPE_FACTOR[type] * CONDITION_FACTOR[condition]
  const mid = perM2 * areaM2
  return {
    mid: Math.round(mid),
    low: Math.round(mid * (1 - RANGE)),
    high: Math.round(mid * (1 + RANGE)),
    pricePerM2: Math.round(perM2),
  }
}
