"use client"

import EstimaLogo from "@/components/brand/EstimaLogo"
import { useI18n } from "@/lib/i18n"

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 py-8 text-center">
        <EstimaLogo markClassName="h-6 w-6" textClassName="text-sm" />
        <p className="text-sm text-slate-500">{t("footer.tagline")}</p>
        <p className="text-xs text-slate-400">{t("footer.disclaimer")}</p>
        <a
          href="mailto:hello@estima.sk"
          className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
        >
          {t("footer.contact")}: hello@estima.sk
        </a>
      </div>
    </footer>
  )
}
