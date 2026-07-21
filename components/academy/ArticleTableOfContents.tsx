"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TocItem } from "@/lib/academy"

// Table of contents for the CURRENT article only — headings, never the full
// academy index. Sticky rail on desktop; a collapsible "Obsah článku" control
// on mobile. Scroll-spy runs against <main> (the app's scroll container).
export default function ArticleTableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const scroller = document.querySelector("main")
    if (!scroller) return
    const OFFSET = 140 // clear the navbar + progress bar

    const update = () => {
      let current = items[0]?.id ?? ""
      for (const item of items) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top - OFFSET <= 0) current = item.id
      }
      setActive(current)
    }
    update()
    scroller.addEventListener("scroll", update, { passive: true })
    return () => {
      scroller.removeEventListener("scroll", update)
    }
  }, [items])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    setActive(id)
    setOpen(false)
  }

  const list = (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={go(item.id)}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "block rounded-md px-3 py-1.5 text-[13px] leading-snug transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60",
              active === item.id
                ? "bg-steel/15 font-medium text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label="Obsah článku"
        className="hidden lg:block sticky top-8 self-start"
      >
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Obsah článku
        </p>
        {list}
      </nav>

      {/* Mobile collapsible */}
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/60"
        >
          <span className="inline-flex items-center gap-2">
            <List className="h-4 w-4 text-slate-400" />
            Obsah článku
          </span>
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
        </button>
        {open && <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2">{list}</div>}
      </div>
    </>
  )
}
