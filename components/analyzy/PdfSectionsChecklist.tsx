"use client"

import { useState } from "react"
import { Check, FileDown, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

const SECTIONS = [
  "overview",
  "valuation",
  "market",
  "comparables",
  "buyVsRent",
  "location",
  "photo",
  "methodology",
] as const

interface Props {
  exporting: boolean
  onExport: () => void
}

export default function PdfSectionsChecklist({ exporting, onExport }: Props) {
  const { t } = useI18n()
  // Locally toggleable — which sections go into the generated client report.
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map((s) => [s, true])),
  )

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">{t("analyses.pdf.title")}</h3>
        <p className="text-xs text-slate-400 mb-3">{t("analyses.pdf.subtitle")}</p>

        <ul className="space-y-1.5 mb-4">
          {SECTIONS.map((s) => {
            const on = enabled[s]
            return (
              <li key={s}>
                <button
                  onClick={() => setEnabled((prev) => ({ ...prev, [s]: !prev[s] }))}
                  className="flex w-full items-center gap-2.5 text-left text-xs"
                >
                  <span
                    className={`h-4 w-4 shrink-0 rounded flex items-center justify-center border transition-colors ${
                      on ? "bg-emerald-600 border-emerald-600" : "border-slate-300 bg-white"
                    }`}
                  >
                    {on && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <span className={on ? "text-slate-700" : "text-slate-400 line-through"}>
                    {t(`analyses.pdf.section.${s}`)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <Button variant="emerald" className="w-full gap-2" disabled={exporting} onClick={onExport}>
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("analyses.generating")}
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              {t("analyses.pdf.export")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
