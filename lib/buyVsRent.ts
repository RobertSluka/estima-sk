// Buy-vs-rent simulation (pure, no React). Monthly steps over a fixed 30-year
// horizon: both scenarios spend the same total each month — whichever side pays
// less for housing invests the difference at the given return. Buyer wealth =
// property value − remaining loan + invested surplus; renter wealth = invested
// down payment + invested surplus. Inflation drives rent growth; the property
// appreciates at its own rate so it can be compared against investment yields.
//
// Two modes share the same loop:
// - "occupier": rent is the housing cost the buyer avoids. Owner-side taxes,
//   maintenance and transaction costs are out of scope (mirrors Valuo's model).
// - "landlord" (buy-to-let): rent is income — reduced by vacancy, running
//   costs and rental tax — that offsets the mortgage payment; the alternative
//   invests the down payment plus the same out-of-pocket top-ups. Own housing
//   is paid equally in both scenarios, so it cancels out. Mathematically this
//   is the occupier model with rent scaled by the net-income factor.

export const HORIZON_YEARS = 30

// Long-run nominal annual averages used as one-click reference points for the
// investment-return input. Periods are disclosed in the UI disclaimer; figures
// are deliberately round (S&P 500 incl. dividends since 1928 ≈ 10 %, gold
// since 1971 ≈ 8 %, bitcoin 2016–2026 CAGR ≈ 60 %, savings ≈ current SK
// deposit rates).
export interface YieldPreset {
  key: "savings" | "gold" | "sp500" | "btc"
  returnPct: number
}

// Long-run average annual property price growth by kraj, computed from the
// NBS regional price series (average €/m² by region, nbs.sk): 2002 annual
// value → 4Q 2025 (~23.5 years). The window includes the 2005–2008
// convergence boom, so treat these as optimistic long-run figures.
export interface RegionGrowth {
  key: "sk" | "ba" | "tt" | "tn" | "nr" | "za" | "bb" | "ke" | "po"
  growthPct: number
}

export const REGION_GROWTH: RegionGrowth[] = [
  { key: "sk", growthPct: 7.0 },
  { key: "ba", growthPct: 6.9 },
  { key: "tt", growthPct: 7.4 },
  { key: "tn", growthPct: 6.0 },
  { key: "nr", growthPct: 6.5 },
  { key: "za", growthPct: 7.4 },
  { key: "bb", growthPct: 7.0 },
  { key: "ke", growthPct: 7.6 },
  { key: "po", growthPct: 8.0 },
]

export const YIELD_PRESETS: YieldPreset[] = [
  { key: "savings", returnPct: 2 },
  { key: "gold", returnPct: 8 },
  { key: "sp500", returnPct: 10 },
  { key: "btc", returnPct: 60 },
]

export type BuyVsRentMode = "occupier" | "landlord"

export interface BuyVsRentInputs {
  mode: BuyVsRentMode
  propertyPrice: number
  /** Annual property appreciation, decoupled from inflation. */
  propertyGrowthPct: number
  monthlyRent: number
  mortgageRatePct: number
  ltvPct: number
  termYears: number
  inflationPct: number
  investmentReturnPct: number
  /** Landlord mode only: share of the year the unit sits empty. */
  vacancyPct: number
  /** Landlord mode only: maintenance & management as a share of rent. */
  costsPct: number
  /** Landlord mode only: tax on net rental income. */
  rentalTaxPct: number
}

export interface WealthPoint {
  year: number
  buyer: number
  renter: number
}

export interface BuyVsRentResult {
  downPayment: number
  monthlyPayment: number
  /** Landlord mode: first-month rent after vacancy, costs and tax. */
  initialNetRent: number
  points: WealthPoint[]
  buyerFinal: number
  renterFinal: number
  /** First year the buyer's net wealth reaches the renter's; null if never. */
  breakevenYear: number | null
}

export function simulateBuyVsRent(inp: BuyVsRentInputs): BuyVsRentResult {
  const price = Math.max(0, inp.propertyPrice)
  const ltv = Math.min(100, Math.max(0, inp.ltvPct)) / 100
  const loan = price * ltv
  const downPayment = price - loan
  const termMonths = Math.max(1, Math.round(inp.termYears * 12))
  const monthlyRate = inp.mortgageRatePct / 100 / 12
  const monthlyPayment =
    monthlyRate === 0
      ? loan / termMonths
      : (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
  const monthlyInflation = Math.pow(1 + inp.inflationPct / 100, 1 / 12)
  const monthlyAppreciation = Math.pow(1 + inp.propertyGrowthPct / 100, 1 / 12)
  const monthlyReturn = Math.pow(1 + inp.investmentReturnPct / 100, 1 / 12)
  const clampShare = (v: number) => Math.min(100, Math.max(0, v)) / 100
  // Landlord: only the net rent (after vacancy, costs, tax) offsets the
  // mortgage; occupier: the full rent is the avoided housing cost.
  const rentFactor =
    inp.mode === "landlord"
      ? (1 - clampShare(inp.vacancyPct)) *
        (1 - clampShare(inp.costsPct)) *
        (1 - clampShare(inp.rentalTaxPct))
      : 1

  let balance = loan
  let rent = Math.max(0, inp.monthlyRent) * rentFactor
  let value = price
  let renterPortfolio = downPayment
  let buyerPortfolio = 0
  let breakevenYear: number | null = null
  const points: WealthPoint[] = [
    { year: 0, buyer: Math.round(value - balance), renter: Math.round(renterPortfolio) },
  ]

  for (let m = 1; m <= HORIZON_YEARS * 12; m++) {
    renterPortfolio *= monthlyReturn
    buyerPortfolio *= monthlyReturn
    const buyerCost = m <= termMonths ? monthlyPayment : 0
    const diff = buyerCost - rent
    if (diff > 0) renterPortfolio += diff
    else buyerPortfolio -= diff
    if (m <= termMonths) balance = Math.max(0, balance * (1 + monthlyRate) - monthlyPayment)
    value *= monthlyAppreciation
    rent *= monthlyInflation

    if (m % 12 === 0) {
      const year = m / 12
      const buyer = Math.round(value - balance + buyerPortfolio)
      const renter = Math.round(renterPortfolio)
      points.push({ year, buyer, renter })
      if (breakevenYear === null && buyer >= renter) breakevenYear = year
    }
  }

  const last = points[points.length - 1]
  return {
    downPayment,
    monthlyPayment,
    initialNetRent: Math.max(0, inp.monthlyRent) * rentFactor,
    points,
    buyerFinal: last.buyer,
    renterFinal: last.renter,
    breakevenYear,
  }
}
