"use client"

// Renderer shared by the two legal routes (/obchodne-podmienky,
// /ochrana-osobnych-udajov). The document text lives in lib/legal.ts and is
// selected by the app language toggle, so both routes stay a thin wrapper.

import Link from "next/link"
import { ArrowRight, Building2, Mail } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import {
  COMPANY,
  LEGAL_ROUTES,
  legalContent,
  type LegalSection,
} from "@/lib/legal"

type DocKey = "terms" | "privacy"

function Section({ section }: { section: LegalSection }) {
  return (
    <section className="scroll-mt-20">
      <h2 className="text-lg font-bold tracking-tight text-slate-900">
        {section.heading}
      </h2>
      {section.paragraphs?.map((p) => (
        <p key={p} className="mt-3 text-[15px] leading-relaxed text-slate-600">
          {p}
        </p>
      ))}
      {section.bullets && (
        <ul className="mt-3 space-y-2">
          {section.bullets.map((b) => (
            <li
              key={b}
              className="flex gap-3 text-[15px] leading-relaxed text-slate-600"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-steel" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function LegalDoc({ doc }: { doc: DocKey }) {
  const { lang } = useI18n()
  const c = legalContent[lang]
  const document = c[doc]

  // The cross-link always points at the sibling document.
  const other = doc === "terms" ? "privacy" : "terms"

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 lg:py-16">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full border border-slate-300" />
        {COMPANY.name}
      </p>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        {document.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-500">
        {document.intro}
      </p>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
        <span>
          {c.versionLabel} {document.version}
        </span>
        <span>
          {c.effectiveLabel} {document.effective}
        </span>
      </div>

      {/* ── Operator identity ───────────────────────────────────────────── */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          <Building2 className="h-3.5 w-3.5" />
          {c.operatorLabel}
        </p>
        <p className="mt-3 text-sm font-semibold text-slate-900">
          {COMPANY.name}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {COMPANY.street}
          <br />
          {COMPANY.city}, {COMPANY.country[lang]}
          <br />
          IČO: {COMPANY.ico} · DIČ: {COMPANY.dic}
          <br />
          {COMPANY.register[lang]}
        </p>
        <a
          href={`mailto:${COMPANY.email}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
        >
          <Mail className="h-4 w-4" />
          {COMPANY.email}
        </a>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="mt-10 space-y-9">
        {document.sections.map((section) => (
          <Section key={section.heading} section={section} />
        ))}
      </div>

      {/* ── Sibling document ────────────────────────────────────────────── */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {c.otherDocLabel}
        </p>
        <Link
          href={LEGAL_ROUTES[other]}
          className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-slate-900 underline-offset-4 hover:underline"
        >
          {c[other].title}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
