// Buy-vs-rent simulation (pure, no React). Monthly steps over a fixed 30-year
// horizon: both scenarios spend the same total each month — whichever side pays
// less for housing invests the difference at the given return. Buyer wealth =
// property value − remaining loan + invested surplus; renter wealth = invested
// down payment + invested surplus. One simplifying assumption: inflation drives
// both rent growth and property appreciation. Taxes, maintenance and
// transaction costs are deliberately out of scope (mirrors Valuo's model).

export const HORIZON_YEARS = 30

export interface BuyVsRentInputs {
  propertyPrice: number
  monthlyRent: number
  mortgageRatePct: number
  ltvPct: number
  termYears: number
  inflationPct: number
  investmentReturnPct: number
}

export interface WealthPoint {
  year: number
  buyer: number
  renter: number
}

export interface BuyVsRentResult {
  downPayment: number
  monthlyPayment: number
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
  const monthlyReturn = Math.pow(1 + inp.investmentReturnPct / 100, 1 / 12)

  let balance = loan
  let rent = Math.max(0, inp.monthlyRent)
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
    value *= monthlyInflation
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
    points,
    buyerFinal: last.buyer,
    renterFinal: last.renter,
    breakevenYear,
  }
}
