"use client"

import { ArrowUpDown } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import type { SortKey } from "@/lib/opportunity"

// Labels live here (not in lib/i18n.tsx) so the control stays self-contained.
const LABELS = {
  sk: {
    sort: "Zoradiť",
    options: {
      opportunity: "Najlepšia príležitosť",
      discount: "Najväčšia zľava",
      yield: "Najvyšší výnos",
      newest: "Najnovšie",
      drops: "Zľavnené",
      ppsmAsc: "Najnižšia cena/m²",
      confidence: "Najvyššia spoľahlivosť",
    } as Record<SortKey, string>,
  },
  en: {
    sort: "Sort",
    options: {
      opportunity: "Best opportunity",
      discount: "Biggest discount",
      yield: "Highest yield",
      newest: "Newest",
      drops: "Price drops",
      ppsmAsc: "Lowest price/m²",
      confidence: "Highest confidence",
    } as Record<SortKey, string>,
  },
} as const

const ORDER: SortKey[] = [
  "opportunity",
  "discount",
  "yield",
  "newest",
  "drops",
  "ppsmAsc",
  "confidence",
]

export default function SortControl({
  value,
  onChange,
}: {
  value: SortKey
  onChange: (key: SortKey) => void
}) {
  const { lang } = useI18n()
  const labels = LABELS[lang === "en" ? "en" : "sk"]
  return (
    <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500">
      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
      <span className="hidden sm:inline">{labels.sort}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="cursor-pointer bg-transparent font-semibold text-slate-700 focus:outline-none"
      >
        {ORDER.map((id) => (
          <option key={id} value={id}>
            {labels.options[id]}
          </option>
        ))}
      </select>
    </label>
  )
}
