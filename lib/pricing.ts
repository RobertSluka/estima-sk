// Pricing page content, per language. Structured (plans carry feature arrays),
// so it lives here rather than as flat dot-keys in lib/i18n. Mirrors the Estima
// plan structure (Basic free · Pro €9.90/mo · Invest custom) plus metered API
// tiers. There is no billing backend — CTAs route to contact.

import type { Lang } from "@/lib/i18n"

export type PlanId = "basic" | "pro" | "invest"

export interface Plan {
  id: PlanId
  name: string
  price: string
  period?: string
  tagline: string
  features: string[]
  highlighted?: boolean
}

export interface ApiTier {
  name: string
  price: string
  period: string
  included: string
  overage: string
}

export interface PricingContent {
  heading: string
  subheading: string
  mostPopular: string
  ctaGetStarted: string
  ctaContact: string
  billingNote: string
  plans: Plan[]
  apiHeading: string
  apiSubheading: string
  apiTiers: ApiTier[]
  apiCta: string
  apiNote: string
}

export const pricingContent: Record<Lang, PricingContent> = {
  sk: {
    heading: "Jednoduché ceny pre múdrejšie realitné rozhodnutia",
    subheading:
      "Začnite zadarmo, prejdite na vyšší tarif, keď budete chcieť plnú realitnú inteligenciu. Individuálne plány pre tímy a inštitúcie.",
    mostPopular: "Najobľúbenejší",
    ctaGetStarted: "Začať",
    ctaContact: "Kontaktovať nás",
    billingNote: "Ceny v EUR bez DPH. Zrušiť možno kedykoľvek.",
    plans: [
      {
        id: "basic",
        name: "Basic",
        price: "Zadarmo",
        tagline: "Orientačný odhad a kalkulačky pre každého.",
        features: [
          "Orientačný odhad ceny podľa krajov",
          "Kalkulačka kúpa vs nájom",
          "Trhové prehľady (NBS)",
          "3 odhady mesačne",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: "9,90 €",
        period: "/mesiac",
        tagline: "Plná realitná inteligencia pre aktívnych investorov a maklérov.",
        highlighted: true,
        features: [
          "Všetko z Basic",
          "Neobmedzené odhady",
          "Porovnateľné inzeráty s fotografiami",
          "Upozornenia na nové inzeráty",
          "Sledovanie portfólia a zliav",
        ],
      },
      {
        id: "invest",
        name: "Invest",
        price: "Na mieru",
        tagline: "Pre tímy, banky a inštitúcie.",
        features: [
          "Všetko z Pro",
          "PDF reporty s vašou značkou (logo a farby)",
          "Automatizované ocenenia cez API (AVM)",
          "Trhová inteligencia a heatmapy",
          "SLA a dedikovaná podpora",
        ],
      },
    ],
    apiHeading: "Estima API",
    apiSubheading:
      "Vložte automatizované ocenenia (AVM) a trhové dáta priamo do svojho produktu — pre banky, poisťovne, poradenské siete a portály.",
    apiTiers: [
      {
        name: "Start",
        price: "49 €",
        period: "/mesiac",
        included: "100 ocenení v cene",
        overage: "ďalej 0,40 € za ocenenie",
      },
      {
        name: "Growth",
        price: "199 €",
        period: "/mesiac",
        included: "1 000 ocenení v cene",
        overage: "ďalej 0,25 € za ocenenie",
      },
      {
        name: "Scale",
        price: "499 €",
        period: "/mesiac",
        included: "5 000 ocenení v cene",
        overage: "ďalej 0,15 € za ocenenie",
      },
    ],
    apiCta: "Vyžiadať prístup k API",
    apiNote: "Orientačné ceny — finálna ponuka závisí od objemu a rozsahu dát.",
  },
  en: {
    heading: "Simple pricing for smarter property decisions",
    subheading:
      "Start free, upgrade when you want the full property intelligence. Custom plans for teams and institutions.",
    mostPopular: "Most popular",
    ctaGetStarted: "Get started",
    ctaContact: "Contact us",
    billingNote: "Prices in EUR, VAT excluded. Cancel anytime.",
    plans: [
      {
        id: "basic",
        name: "Basic",
        price: "Free",
        tagline: "Indicative estimates and calculators for everyone.",
        features: [
          "Indicative price estimate by region",
          "Buy-vs-rent calculator",
          "Market insights (NBS)",
          "3 estimates per month",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: "€9.90",
        period: "/month",
        tagline: "Full property intelligence for active investors and agents.",
        highlighted: true,
        features: [
          "Everything in Basic",
          "Unlimited estimates",
          "Comparable listings with photos",
          "Alerts on new listings",
          "Portfolio & price-drop tracking",
        ],
      },
      {
        id: "invest",
        name: "Invest",
        price: "Custom",
        tagline: "For teams, banks and institutions.",
        features: [
          "Everything in Pro",
          "Branded PDF reports (your logo & colors)",
          "Automated valuations via API (AVM)",
          "Market intelligence & heatmaps",
          "SLA & dedicated support",
        ],
      },
    ],
    apiHeading: "Estima API",
    apiSubheading:
      "Embed automated valuations (AVM) and market data directly into your product — built for banks, insurers, advisory networks and portals.",
    apiTiers: [
      {
        name: "Start",
        price: "€49",
        period: "/month",
        included: "100 valuations included",
        overage: "then €0.40 per valuation",
      },
      {
        name: "Growth",
        price: "€199",
        period: "/month",
        included: "1,000 valuations included",
        overage: "then €0.25 per valuation",
      },
      {
        name: "Scale",
        price: "€499",
        period: "/month",
        included: "5,000 valuations included",
        overage: "then €0.15 per valuation",
      },
    ],
    apiCta: "Request API access",
    apiNote: "Indicative pricing — the final quote depends on volume and data scope.",
  },
}
