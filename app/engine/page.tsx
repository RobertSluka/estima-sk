"use client"

import Link from "next/link"
import {
  Database,
  Filter,
  Layers,
  GitBranch,
  SlidersHorizontal,
  CheckCircle2,
  Tag,
  Eye,
  ArrowRight,
  ArrowDown,
  CornerDownRight,
  ChefHat,
  Bath,
  Sun,
  Layout,
  Sparkles,
  Gem,
  Hammer,
  Image as ImageIcon,
  BadgeCheck,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import HeroValuationShowcase from "@/components/hero/HeroValuationShowcase"

/* ── small shared atoms, matching the marketing pages' design language ────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
      <span className="inline-block w-2 h-2 rounded-full border border-slate-300 shrink-0" />
      {children}
    </p>
  )
}

function PhaseHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {children}
      </h3>
      <span aria-hidden className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

/* secondary connector between process phases — a quiet line + arrow, not a rail */
function PhaseConnector() {
  return (
    <div aria-hidden className="my-3 flex flex-col items-center">
      <span className="h-4 w-px bg-slate-300" />
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm print:shadow-none">
        <ArrowDown className="h-3 w-3" />
      </span>
      <span className="h-4 w-px bg-slate-300" />
    </div>
  )
}

function StepCard({
  icon: Icon,
  number,
  title,
  body,
}: {
  icon: typeof Database
  number: string
  title: string
  body: string
}) {
  return (
    <li className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[border-color,box-shadow] hover:border-slate-300 hover:shadow motion-reduce:transition-none print:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-slate-500">
          {number}
        </span>
      </div>
      <h4 className="mt-4 text-[15px] font-semibold leading-snug text-slate-900">{title}</h4>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{body}</p>
    </li>
  )
}

/* ── static (non-text) data — labels resolved via t() at render ───────────── */

// steps 01–06 icons grouped by process phase; 07 is the highlighted result card
const phaseIcons: (typeof Database)[][] = [
  [Database, Filter],
  [Layers, GitBranch, SlidersHorizontal, CheckCircle2],
]

// order mirrors SCORE_FIELDS in the backend (vision_* model features)
const visualIcons = [
  CheckCircle2,
  ChefHat,
  Bath,
  Layout,
  Sun,
  Hammer,
  Sparkles,
  ImageIcon,
  Gem,
]
const visualScores = [8, 9, 7, 6, 8, 4, 7, 8, 5]

/* ── page ─────────────────────────────────────────────────────────────────── */

export default function EnginePage() {
  const { t } = useI18n()

  // Manually maintained — keep in line with reality (data.estima.sk/listings,
  // /market-index/districts). Overstated numbers on a public page undermine
  // the credibility this page exists to build.
  const metrics = [
    { value: "350+", label: t("engine.metric1") },
    { value: "8", label: t("engine.metric2") },
    { value: "56", label: t("engine.metric3") },
    { value: t("engine.metric4Value"), label: t("engine.metric4") },
  ]

  // steps 01–02 (market data) and 03–06 (Estima Engine); 07 is the result card
  const phases = phaseIcons.map((icons, p) => ({
    label: t(p === 0 ? "engine.phaseData" : "engine.phaseEngine"),
    steps: icons.map((icon, i) => {
      const n = p === 0 ? i + 1 : i + 3
      return {
        icon,
        number: String(n).padStart(2, "0"),
        title: t(`engine.step${n}Title`),
        body: t(`engine.step${n}Body`),
      }
    }),
  }))

  const visualAttributes = visualIcons.map((icon, i) => ({
    icon,
    label: t(`engine.va${i + 1}`),
  }))

  const outputs = [
    { label: t("engine.out1"), value: "178 000", unit: "€" },
    { label: t("engine.out2"), value: "165 000", unit: "€" },
    { label: t("engine.out3"), value: "750", unit: "€/mes." },
    { label: t("engine.out4"), value: "4,2 %", unit: "p.a." },
  ]

  return (
    <div>
      {/* ── Hero: photo + floating valuation cards (reuses engine i18n copy) ─ */}
      <HeroValuationShowcase
        eyebrow={t("engine.badge")}
        headline={t("engine.title")}
        subtitle={
          <>
            {t("engine.heroPre")}{" "}
            <strong className="text-slate-700 font-semibold">{t("engine.heroAttrs")}</strong>
            {t("engine.heroPost")}
          </>
        }
        primaryCta={{ label: t("engine.ctaOpen"), href: "/inzeraty" }}
        secondaryCta={{ label: t("engine.ctaAnalyze"), href: "/odhad" }}
      />

      {/* ── Rest of the engine page ──────────────────────────────────────── */}
      <div className="mx-auto max-w-[900px] px-6 pb-12 pt-10">
        {/* ── Metrics strip ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white px-5 py-5 flex flex-col">
              <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {m.value}
              </span>
              <span className="mt-1 text-[11px] leading-snug text-slate-400">{m.label}</span>
            </div>
          ))}
        </div>

        {/* ── How the market estimate is made ────────────────────────────── */}
        <section aria-labelledby="engine-process-title" className="mt-14">
          <div className="mb-8 max-w-2xl">
            <SectionLabel>{t("engine.archLabel")}</SectionLabel>
            <h2
              id="engine-process-title"
              className="text-3xl font-bold tracking-tight text-slate-900"
            >
              {t("engine.archTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
              {t("engine.archSub")}
            </p>
          </div>

          {phases.map((phase, p) => (
            <div key={phase.label}>
              {p > 0 && <PhaseConnector />}
              <PhaseHeading>{phase.label}</PhaseHeading>
              <ol className="grid gap-4 sm:grid-cols-2">
                {phase.steps.map((step) => (
                  <StepCard key={step.number} {...step} />
                ))}
              </ol>
            </div>
          ))}

          <PhaseConnector />

          {/* result card — the one highlighted output of the whole process */}
          <PhaseHeading>{t("engine.phaseResult")}</PhaseHeading>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm sm:p-7 print:shadow-none">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Tag className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="rounded-md border border-emerald-200 bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-emerald-700">
                07
              </span>
            </div>
            <h4 className="mt-4 text-lg font-semibold leading-snug text-slate-900">
              {t("engine.step7Title")}
            </h4>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-slate-600">
              {t("engine.step7Body")}
            </p>

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
              {t("engine.resExample")}
            </p>
            <dl className="mt-2.5 grid gap-5 sm:grid-cols-[1.4fr_1.2fr_1fr] sm:gap-6">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {t("engine.resValue")}
                </dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  188 000 €
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {t("engine.resRange")}
                </dt>
                <dd className="mt-2 text-lg font-semibold text-slate-700 tabular-nums">
                  182 000 – 194 000 €
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {t("engine.resConfidence")}
                </dt>
                <dd className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-semibold leading-none text-emerald-800">
                    {t("engine.resConfidenceValue")}
                  </span>
                </dd>
              </div>
            </dl>

            {/* compact status line — replaces the old full-width dark band */}
            <div className="mt-6 flex items-center gap-2.5 border-t border-emerald-200/70 pt-4">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping motion-reduce:hidden print:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-slate-700">{t("engine.resStatus")}</span>
              <span className="ml-auto flex items-center gap-1.5 shrink-0">
                <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  {t("engine.flowEngine")}
                </span>
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
              </span>
            </div>
          </div>
        </section>

        {/* ── Visual analysis ────────────────────────────────────────────── */}
        <div className="mt-14 bg-white border border-slate-200 rounded-xl p-7">
          <SectionLabel>{t("engine.visualLabel")}</SectionLabel>
          <div className="flex items-start gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 shrink-0">
              <Eye className="h-4.5 w-4.5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {t("engine.visualTitle")}
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                {t("engine.visualSub")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visualAttributes.map((a, i) => {
              const Icon = a.icon
              // deterministic pseudo-score for the demo bars
              const score = visualScores[i]
              return (
                <div
                  key={a.label}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate">{a.label}</span>
                    <span className="ml-auto text-[11px] font-semibold text-slate-900 tabular-nums">
                      {score}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full"
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* connection back into the pipeline */}
          <div className="mt-5 flex items-center gap-2 border-t border-dashed border-slate-200 pt-4">
            <CornerDownRight className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {t("engine.visualFeeds")}
            </span>
          </div>
        </div>

        {/* ── Output ─────────────────────────────────────────────────────── */}
        <div className="mt-14">
          <SectionLabel>{t("engine.outLabel")}</SectionLabel>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
            {t("engine.outTitle")}
          </h2>
          <p className="text-sm text-slate-500 mb-7 max-w-xl">
            {t("engine.outSub")}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {outputs.map((o) => (
              <div
                key={o.label}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {o.label}
                </span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {o.value}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{o.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div className="mt-14 rounded-2xl bg-slate-900 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t("engine.ctaTitle")}
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            {t("engine.ctaSub")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Link
              href="/inzeraty"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 px-5 py-2.5 rounded-lg transition-colors"
            >
              {t("engine.ctaOpen")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/odhad"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-5 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
            >
              {t("engine.ctaAnalyze")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
