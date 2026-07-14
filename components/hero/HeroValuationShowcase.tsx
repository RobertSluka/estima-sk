"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  ChefHat,
  Hammer,
  PlayCircle,
  ScanLine,
  Sun,
  TreePine,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

/**
 * "Valuation Showcase" hero — a real interior photo overlaid with floating
 * glassmorphism cards that read like a live Estima valuation. Ported from the
 * CZ app (byteval); labels go through i18n and the demo numbers are EUR,
 * sized for a Slovak (Košice-level) apartment.
 *
 * Photo lives at /public/hero-interior.jpg (swap `imageSrc`). Framer Motion
 * handles the staggered entrance; CSS handles the gentle float loop
 * (.hero-anim-float). Both respect prefers-reduced-motion.
 */

/* ------------------------------------------------------------------ */
/* Placeholder data — labels are i18n keys resolved at render.         */
/* ------------------------------------------------------------------ */

type Tone = "positive" | "neutral" | "negative"

// Attribute chips with a dotted leader line pointing into the photo.
// pos = chip position (% of showcase box); target = where the leader points.
const attributes: {
  id: string
  icon: typeof Sun
  labelKey: string
  valueKey: string
  tone: Tone
  pos: { x: number; y: number }
  target: { x: number; y: number }
}[] = [
  {
    id: "sun",
    icon: Sun,
    labelKey: "hero.attrSun",
    valueKey: "hero.attrSunValue",
    tone: "positive",
    pos: { x: 14, y: 34 },
    target: { x: 30, y: 40 },
  },
  {
    id: "kitchen",
    icon: ChefHat,
    labelKey: "hero.attrKitchen",
    valueKey: "hero.attrKitchenValue",
    tone: "positive",
    pos: { x: 44, y: 27 },
    target: { x: 58, y: 36 },
  },
  {
    id: "visual",
    icon: ScanLine,
    labelKey: "hero.attrVisual",
    valueKey: "hero.attrVisualValue",
    tone: "neutral",
    pos: { x: 78, y: 17 },
    target: { x: 70, y: 33 },
  },
  {
    id: "floor",
    icon: TreePine,
    labelKey: "hero.attrFloor",
    valueKey: "hero.attrFloorValue",
    tone: "positive",
    // right side, pointing at the exposed wood floor by the right wall
    pos: { x: 63, y: 80 },
    target: { x: 85, y: 90 },
  },
  {
    id: "reno",
    icon: Hammer,
    labelKey: "hero.attrReno",
    valueKey: "hero.attrRenoValue",
    tone: "neutral",
    pos: { x: 56, y: 60 },
    target: { x: 64, y: 50 },
  },
]

// Left-edge metric cards with mini sparklines.
const metrics: { labelKey: string; value: string; spark: number[] }[] = [
  { labelKey: "hero.metricPpsm", value: "3 300 €", spark: [4, 6, 5, 7, 6, 8, 9] },
  { labelKey: "hero.metricRent", value: "780 €", spark: [5, 4, 6, 5, 7, 6, 8] },
  { labelKey: "hero.metricYield", value: "5,1 %", spark: [3, 4, 4, 6, 5, 7, 8] },
]

// Right-side value-calculation breakdown.
const calcRows: { labelKey: string; delta: string; tone: Tone }[] = [
  { labelKey: "hero.calcComparable", delta: "172 000 €", tone: "neutral" },
  { labelKey: "hero.calcLocation", delta: "+ 9 000 €", tone: "positive" },
  { labelKey: "hero.calcAttributes", delta: "+ 11 000 €", tone: "positive" },
  { labelKey: "hero.calcInterior", delta: "+ 7 000 €", tone: "positive" },
  { labelKey: "hero.calcCondition", delta: "− 6 000 €", tone: "negative" },
  { labelKey: "hero.calcTiming", delta: "− 8 000 €", tone: "negative" },
]

/* ------------------------------------------------------------------ */
/* Props                                                                */
/* ------------------------------------------------------------------ */

type Cta = { label: string; href?: string }

export type HeroValuationShowcaseProps = {
  eyebrow?: string
  headline: string
  subtitle?: React.ReactNode
  primaryCta: Cta
  secondaryCta: Cta
  imageSrc?: string
}

/* ------------------------------------------------------------------ */
/* Small bits                                                           */
/* ------------------------------------------------------------------ */

const toneText: Record<Tone, string> = {
  positive: "text-emerald-600",
  negative: "text-rose-600",
  neutral: "text-slate-500",
}

function Sparkline({ data }: { data: number[] }) {
  const w = 56
  const h = 18
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="rgb(16 185 129)"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Reusable glass card shell.
function Glass({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md",
        "shadow-[0_10px_40px_-12px_rgba(15,23,42,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

function CtaEl({
  cta,
  className,
  children,
}: {
  cta: Cta
  className?: string
  children: React.ReactNode
}) {
  if (cta.href)
    return (
      <Link href={cta.href} className={className}>
        {children}
      </Link>
    )
  return <button className={className}>{children}</button>
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function HeroValuationShowcase({
  eyebrow,
  headline,
  subtitle,
  primaryCta,
  secondaryCta,
  imageSrc = "/hero-interior.jpg",
}: HeroValuationShowcaseProps) {
  const { t } = useI18n()
  const reduce = !!useReducedMotion()

  // Entrance: fade + lift, staggered across the floating cards.
  const fade = {
    hidden: reduce ? {} : { opacity: 0, y: 16, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1 },
  }
  const stage = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  }

  return (
    <section className="relative overflow-hidden bg-[#f5f6f8]">
      {/* ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 80% 0%, rgba(16,185,129,0.07), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-16 md:pt-20">
        {/* ── Heading ─────────────────────────────────────────────── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          {eyebrow && (
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 uppercase tracking-widest">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {headline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500">
            {subtitle}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <CtaEl
              cta={primaryCta}
              className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
            >
              {primaryCta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </CtaEl>
            <CtaEl
              cta={secondaryCta}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              <PlayCircle className="h-4 w-4" />
              {secondaryCta.label}
            </CtaEl>
          </div>
        </motion.div>

        {/* ── Showcase: photo + floating valuation cards ──────────── */}
        <motion.div
          variants={stage}
          initial="hidden"
          animate="show"
          className="relative mt-10 aspect-[4/5] w-full sm:mt-12 sm:aspect-[16/11] lg:aspect-[16/10]"
        >
          {/* Photo */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl ring-1 ring-slate-900/5 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Moderný interiér bytu analyzovaný Estima Engine"
              className="h-full w-full object-cover"
            />
            {/* gentle vignette so light cards read on any photo */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(105deg, rgba(255,255,255,0.30) 0%, transparent 32%), linear-gradient(0deg, rgba(15,23,42,0.10), transparent 30%)",
              }}
            />
          </div>

          {/* Dotted leader lines from attribute chips into the photo */}
          <svg
            aria-hidden
            className="absolute inset-0 hidden h-full w-full lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {attributes.map((a) => (
              <g key={a.id}>
                <line
                  x1={a.pos.x}
                  y1={a.pos.y}
                  x2={a.target.x}
                  y2={a.target.y}
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth={1}
                  strokeDasharray="0.5 2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={a.target.x}
                  cy={a.target.y}
                  r={0.7}
                  fill="#fff"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </svg>

          {/* Estimated market price — primary card (top-left) */}
          <motion.div
            variants={fade}
            className="absolute left-[1%] top-[5%] z-20 w-[58%] max-w-[300px]"
          >
            <div className={cn(!reduce && "hero-anim-float")}>
              <Glass className="p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {t("hero.priceLabel")}
                </div>
                <div className="mt-1.5 flex items-start gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    185 000 €
                  </span>
                  <ArrowUpRight className="mt-1 h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">{t("hero.rangeLabel")}</p>
                <p className="text-sm font-semibold text-slate-700">172 000 € – 198 000 €</p>
              </Glass>
            </div>
          </motion.div>

          {/* Attribute chips */}
          {attributes.map((a) => {
            const Icon = a.icon
            return (
              <motion.div
                key={a.id}
                variants={fade}
                className="absolute z-20 hidden lg:block"
                style={{ left: `${a.pos.x}%`, top: `${a.pos.y}%` }}
              >
                <Glass className="flex items-center gap-2.5 px-3 py-2">
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                  <div className="leading-tight">
                    <p className="whitespace-nowrap text-[11px] font-medium text-slate-500">
                      {t(a.labelKey)}
                    </p>
                    <p
                      className={cn(
                        "whitespace-nowrap text-[13px] font-semibold",
                        toneText[a.tone],
                      )}
                    >
                      {t(a.valueKey)}
                    </p>
                  </div>
                </Glass>
              </motion.div>
            )
          })}

          {/* Metric cards (left edge, lower) */}
          <div className="absolute left-[1%] top-[55%] z-20 hidden w-[230px] flex-col gap-2.5 md:flex">
            {metrics.map((m) => (
              <motion.div key={m.labelKey} variants={fade}>
                <Glass className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <div className="leading-tight">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t(m.labelKey)}
                    </p>
                    <p className="text-base font-bold tracking-tight text-slate-900">
                      {m.value}
                    </p>
                  </div>
                  <Sparkline data={m.spark} />
                </Glass>
              </motion.div>
            ))}
          </div>

          {/* Value calculation panel (right) */}
          <motion.div
            variants={fade}
            className="absolute right-[1%] top-[44%] z-20 hidden w-[300px] lg:block"
          >
            <Glass className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t("hero.calcTitle")}
              </div>
              <div className="mt-3 space-y-2">
                {calcRows.map((r) => (
                  <div
                    key={r.labelKey}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <span className="text-slate-500">{t(r.labelKey)}</span>
                    <span className={cn("font-medium tabular-nums", toneText[r.tone])}>
                      {r.delta}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3">
                <span className="text-[13px] font-semibold text-slate-900">
                  {t("hero.calcFinal")}
                </span>
                <span className="text-base font-bold tracking-tight text-slate-900">
                  185 000 €
                </span>
              </div>
            </Glass>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
