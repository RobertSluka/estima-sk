// ─── Estima brand lockup ─────────────────────────────────────────────────────
// The production vector recreation of the brand concept: an outlined building
// with a peaked roof and a broken-outline notch, two ascending bars merging
// into its left wall (the wall reads as the third bar), and a small steel
// underline detail. Static SVG exports for external use live in public/brand/;
// this component is the single in-app source so every surface stays in sync.
//
// The mark inherits `currentColor` for its main strokes, so it re-themes with
// the text color around it; the accent follows --logo-accent (globals.css),
// steel-blue in both themes.

import { cn } from "@/lib/utils"

/** Standalone icon/mark — safe down to ~16px (no sub-1px details at 24px). */
export function EstimaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7 42v-8M13 42V27M19 42V14l9-8 9 8v12M37 32v7h-8"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M27 45h11"
        stroke="var(--logo-accent, #91A6C2)"
        strokeWidth="3"
      />
    </svg>
  )
}

/**
 * Horizontal lockup: mark + "Estima.sk" wordmark. The wordmark is HTML text
 * (interface sans-serif), near-white/near-black via the themed slate scale,
 * with a muted steel-grey ".sk".
 */
export default function EstimaLogo({
  className,
  markClassName = "h-6 w-6",
  textClassName = "text-sm",
}: {
  className?: string
  markClassName?: string
  textClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <EstimaMark className={cn("shrink-0 text-slate-900", markClassName)} />
      <span
        className={cn(
          "font-bold tracking-tight text-slate-900 leading-none",
          textClassName,
        )}
      >
        Estima<span className="font-semibold text-slate-500">.sk</span>
      </span>
    </span>
  )
}
