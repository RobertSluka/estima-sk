"use client"

import { cn } from "@/lib/utils"
import { ACADEMY_CATEGORIES } from "@/lib/academy"

export const ALL_CATEGORY = "all"

// Category pills — "Všetky" plus the four thematic areas. Buttons (not links):
// they filter client-side without navigation. Horizontally scrollable on
// mobile; the active pill uses the restrained steel selected state.
export default function CategoryFilters({
  active,
  onChange,
}: {
  active: string
  onChange: (slug: string) => void
}) {
  const options = [
    { slug: ALL_CATEGORY, title: "Všetky" },
    ...ACADEMY_CATEGORIES,
  ]

  return (
    <div
      role="group"
      aria-label="Filtrovať podľa oblasti"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((opt) => {
        const selected = active === opt.slug
        return (
          <button
            key={opt.slug}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.slug)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60 focus-visible:ring-offset-2 focus-visible:ring-offset-page",
              selected
                ? "border-steel/40 bg-steel/15 text-slate-900"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900",
            )}
          >
            {opt.title}
          </button>
        )
      })}
    </div>
  )
}
