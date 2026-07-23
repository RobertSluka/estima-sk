"use client"

// Site-wide footer, rendered inside <main> by app/layout.tsx so it scrolls with
// the page. Three link columns plus a legal bar carrying the operator's
// registration data — the identifiers come from lib/legal.ts (COMPANY), never
// hard-coded here, so the footer and the legal documents cannot drift apart.

import Link from "next/link"
import EstimaLogo from "@/components/brand/EstimaLogo"
import { useI18n } from "@/lib/i18n"
import { COMPANY, LEGAL_ROUTES, companyAddress } from "@/lib/legal"

interface FooterLink {
  href: string
  key: string
  /** Rendered as a plain anchor — /academy is a rewrite, not a Next route. */
  external?: boolean
}

const platformLinks: FooterLink[] = [
  { href: "/", key: "navbar.engine" },
  { href: "/odhad", key: "navbar.estimate" },
  { href: "/kupa-alebo-prenajom", key: "navbar.buyRent" },
  { href: "/cennik", key: "navbar.pricing" },
]

const dataLinks: FooterLink[] = [
  { href: "/trh", key: "navbar.market" },
  { href: "/mapa-cien", key: "nav.priceMap" },
  { href: "/inzeraty", key: "navbar.listings" },
  { href: "/barometer", key: "nav.barometer" },
]

const companyLinks: FooterLink[] = [
  { href: "/kontakt", key: "navbar.contact" },
  { href: "/academy", key: "navbar.academy", external: true },
  { href: LEGAL_ROUTES.terms, key: "footer.terms" },
  { href: LEGAL_ROUTES.privacy, key: "footer.privacy" },
]

function LinkColumn({
  titleKey,
  links,
}: {
  titleKey: string
  links: FooterLink[]
}) {
  const { t } = useI18n()

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {t(titleKey)}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                className="text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                {t(link.key)}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                {t(link.key)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const { lang, t } = useI18n()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-14">
        {/* ── Brand + link columns ──────────────────────────────────────── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <EstimaLogo markClassName="h-7 w-7" textClassName="text-base" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              {t("footer.tagline")}
            </p>
            <a
              href={`mailto:${COMPANY.email}`}
              className="mt-4 inline-block text-sm text-slate-500 underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
            >
              {COMPANY.email}
            </a>
          </div>

          <LinkColumn titleKey="footer.colPlatform" links={platformLinks} />
          <LinkColumn titleKey="footer.colData" links={dataLinks} />
          <LinkColumn titleKey="footer.colCompany" links={companyLinks} />
        </div>

        {/* ── Legal identity bar ────────────────────────────────────────── */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-500">
            {t("footer.operatedBy", { company: COMPANY.name })}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {companyAddress()}, {COMPANY.country[lang]} · IČO: {COMPANY.ico} ·
            DIČ: {COMPANY.dic}
            <br />
            {COMPANY.register[lang]}
          </p>

          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            {t("footer.disclaimer")}
          </p>

          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Pages are statically prerendered, so the year is baked in at
                build time; the client corrects it after a year rolls over. */}
            <p className="text-xs text-slate-400" suppressHydrationWarning>
              {t("footer.rights", { year: String(new Date().getFullYear()) })}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <Link
                href={LEGAL_ROUTES.terms}
                className="text-xs text-slate-400 transition-colors hover:text-slate-900"
              >
                {t("footer.terms")}
              </Link>
              <Link
                href={LEGAL_ROUTES.privacy}
                className="text-xs text-slate-400 transition-colors hover:text-slate-900"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href="/kontakt"
                className="text-xs text-slate-400 transition-colors hover:text-slate-900"
              >
                {t("navbar.contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
