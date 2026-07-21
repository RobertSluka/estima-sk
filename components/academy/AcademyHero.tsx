import { GraduationCap } from "lucide-react"
import { ACADEMY_ARTICLE_COUNT, ACADEMY_CATEGORY_COUNT } from "@/lib/academy"

// Landing hero: eyebrow, heading, supporting copy, then the search slot and a
// small article/category count. Deliberately flat — no gradient or
// illustration, matching the data-driven product surfaces.
export default function AcademyHero({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b border-slate-200 pb-10">
      <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-steel">
        <GraduationCap className="h-4 w-4" />
        Estima Akadémia
      </div>

      <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Lepšie oceňovanie začína lepším rozhodovaním
      </h1>

      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500">
        Praktické príručky pre realitných maklérov — ako oceňovať podložene dátami,
        čítať signály trhu a presvedčivo komunikovať s klientom.
      </p>

      {children && <div className="mt-6 max-w-xl">{children}</div>}

      <p className="mt-4 text-xs text-slate-400">
        {ACADEMY_ARTICLE_COUNT} článkov · {ACADEMY_CATEGORY_COUNT} tematické oblasti
      </p>
    </header>
  )
}
