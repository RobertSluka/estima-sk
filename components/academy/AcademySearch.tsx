"use client"

import { Search, X } from "lucide-react"

// Controlled search box for the academy landing. Filtering happens on the
// page (client-side, no reload); this is a presentational input with a clear
// affordance and a visible focus ring.
export default function AcademySearch({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Hľadať v príručke"
        aria-label="Hľadať v príručke"
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-steel/40 focus:outline-none focus:ring-2 focus:ring-steel/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Vymazať hľadanie"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
