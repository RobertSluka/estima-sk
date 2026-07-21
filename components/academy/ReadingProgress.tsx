"use client"

import { useEffect, useState } from "react"
import { recordProgress } from "@/lib/academyProgress"

// Thin reading-progress bar pinned just under the app header. The app scrolls
// inside <main> (the body is overflow-hidden), so progress tracks that
// container, not the window. Progress is persisted per article so the landing
// page's continue-reading card can show it.
export default function ReadingProgress({ slug }: { slug: string }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const scroller = document.querySelector("main")
    if (!scroller) return

    const update = () => {
      const max = scroller.scrollHeight - scroller.clientHeight
      const next = max > 0 ? (scroller.scrollTop / max) * 100 : 0
      setPct(next)
      recordProgress(slug, next)
    }

    update()
    scroller.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      scroller.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [slug])

  return (
    <div
      className="sticky top-0 z-30 h-0.5 w-full bg-transparent"
      role="progressbar"
      aria-label="Priebeh čítania"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-steel transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
