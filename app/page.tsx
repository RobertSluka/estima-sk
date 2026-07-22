"use client"

// estima.sk landing page — a B2B pitch to real-estate agencies (the product is
// sold as SaaS; the logged-in app is their back office). The hero reuses the
// valuation-showcase visual; Estima Engine internals live at /engine as the
// "how it works" page.
//
// Copy is kept page-local (not lib/i18n.tsx): it's marketing prose used only
// here, and the shared dictionary sees heavy parallel-session churn.

import Link from "next/link"
import {
  ArrowRight,
  Calculator,
  FileText,
  GraduationCap,
  LineChart,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import HeroValuationShowcase from "@/components/hero/HeroValuationShowcase"

const COPY = {
  sk: {
    eyebrow: "Pre realitné kancelárie",
    headline: "Vyhrávajte exkluzívne zmluvy s reportmi podloženými dátami",
    subtitle:
      "Estima pripraví oceňovací report s porovnateľnými inzerátmi, cenovým rozpätím a trhovým kontextom — v brandingu vašej kancelárie a pripravený na prezentáciu majiteľovi.",
    ctaPrimary: "Vytvoriť oceňovací report",
    ctaSecondary: "Pozrieť cenník",
    pillarsLabel: "Čo dostane vaša kancelária",
    pillarsTitle: "Jeden nástroj od náberu po predaj",
    pillars: [
      {
        title: "Oceňovacie reporty",
        body: "Profesionálny PDF report s porovnateľnými inzerátmi a odporúčaným cenovým rozpätím — dôkaz, ktorý majiteľ pochopí.",
        href: "/inzeraty",
        cta: "Otvoriť inzeráty",
      },
      {
        title: "Orientačný odhad",
        body: "Rýchly odhad ceny podľa kraja, mesta a mestskej časti — prvý ukazovateľ pre telefonát s majiteľom.",
        href: "/odhad",
        cta: "Získať odhad",
      },
      {
        title: "Trhové dáta",
        body: "Vývoj cien, mediány a barometer trhu pre argumentáciu, ktorá neobstojí len na pocite.",
        href: "/trh",
        cta: "Preskúmať trh",
      },
      {
        title: "Estima Academy",
        body: "Praktické návody, ako ocenenie obhájiť pred majiteľom a vyhrať zákazku.",
        href: "/academy",
        cta: "Otvoriť Academy",
      },
    ],
    howLabel: "Ako to funguje",
    howTitle: "Poháňané nástrojom Estima Engine™",
    howBody:
      "Architektúra overená na českom trhu. Slovenský model pripravujeme a priebežne zbierame dáta z celého trhu.",
    howCta: "Ako funguje Estima Engine™",
    closingTitle: "Pripravení na prvý report?",
    closingBody:
      "Začnite s reportom pre najbližšiu obhliadku — alebo si pozrite, čo je v cene.",
    closingPrimary: "Cenník",
    closingSecondary: "Kontakt",
  },
  en: {
    eyebrow: "For real-estate agencies",
    headline: "Win exclusive listings with data-backed valuation reports",
    subtitle:
      "Estima prepares a valuation report with comparable listings, a price range and market context — in your agency's branding, ready to present to the owner.",
    ctaPrimary: "Create a valuation report",
    ctaSecondary: "See pricing",
    pillarsLabel: "What your agency gets",
    pillarsTitle: "One tool from listing pitch to sale",
    pillars: [
      {
        title: "Valuation reports",
        body: "A professional PDF report with comparable listings and a recommended price range — evidence an owner understands.",
        href: "/inzeraty",
        cta: "Open listings",
      },
      {
        title: "Quick estimate",
        body: "An indicative price by region, city and city part — a first anchor for the call with the owner.",
        href: "/odhad",
        cta: "Get an estimate",
      },
      {
        title: "Market data",
        body: "Price trends, medians and a market barometer for arguments that don't rest on gut feeling.",
        href: "/trh",
        cta: "Explore the market",
      },
      {
        title: "Estima Academy",
        body: "Practical guides on defending a valuation in front of the owner and winning the listing.",
        href: "/academy",
        cta: "Open Academy",
      },
    ],
    howLabel: "How it works",
    howTitle: "Powered by Estima Engine™",
    howBody:
      "An architecture proven on the Czech market. The Slovak model is in preparation while we keep collecting data across the market.",
    howCta: "How Estima Engine™ works",
    closingTitle: "Ready for your first report?",
    closingBody:
      "Start with a report for your next viewing — or see what's included.",
    closingPrimary: "Pricing",
    closingSecondary: "Contact",
  },
} as const

const PILLAR_ICONS = [FileText, Calculator, LineChart, GraduationCap] as const

export default function LandingPage() {
  const { lang } = useI18n()
  const c = COPY[lang] ?? COPY.sk

  return (
    <div>
      {/* ── Hero: the valuation report is the product — show it ──────────── */}
      <HeroValuationShowcase
        eyebrow={c.eyebrow}
        headline={c.headline}
        subtitle={c.subtitle}
        primaryCta={{ label: c.ctaPrimary, href: "/inzeraty" }}
        secondaryCta={{ label: c.ctaSecondary, href: "/cennik" }}
      />

      <div className="mx-auto max-w-[900px] px-6 pb-14 pt-10">
        {/* ── Product pillars ────────────────────────────────────────────── */}
        <section aria-labelledby="pillars-title">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            <span className="inline-block w-2 h-2 rounded-full border border-slate-300 shrink-0" />
            {c.pillarsLabel}
          </p>
          <h2
            id="pillars-title"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            {c.pillarsTitle}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {c.pillars.map((p, i) => {
              const Icon = PILLAR_ICONS[i]
              return (
                <Card key={p.href} className="group transition-colors hover:border-steel/40">
                  <CardContent className="flex h-full flex-col p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-steel/10 text-steel">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{p.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{p.body}</p>
                    <Link
                      href={p.href}
                      className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-steel transition-colors hover:text-slate-900"
                    >
                      {p.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* ── Engine credibility strip → /engine ─────────────────────────── */}
        <section aria-labelledby="how-title" className="mt-14">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="max-w-xl">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {c.howLabel}
                </p>
                <h2 id="how-title" className="mt-1.5 text-lg font-semibold text-slate-900">
                  {c.howTitle}
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{c.howBody}</p>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/engine">
                  {c.howCta}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* ── Closing CTA ────────────────────────────────────────────────── */}
        <section className="mt-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{c.closingTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            {c.closingBody}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/cennik">
                {c.closingPrimary}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/kontakt">{c.closingSecondary}</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
