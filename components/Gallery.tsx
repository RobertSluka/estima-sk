"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ImageIcon, ExternalLink } from "lucide-react"

// Multi-image gallery: main image with prev/next + a thumbnail strip.
// Falls back gracefully to a single image or a placeholder.
export default function Gallery({
  images,
  alt,
  sourceUrl,
  moreLabel,
}: {
  images: string[]
  alt: string
  sourceUrl?: string | null
  moreLabel?: string
}) {
  const [active, setActive] = useState(0)
  const has = images.length > 0
  const multi = images.length > 1
  const i = Math.min(active, Math.max(0, images.length - 1))

  const go = (dir: number) =>
    setActive((a) => (images.length ? (a + dir + images.length) % images.length : 0))

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 group">
        {has ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[i]}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-slate-300" />
          </div>
        )}

        {multi && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 left-3 rounded-md bg-slate-900/70 px-2 py-0.5 text-xs font-medium text-white tabular-nums">
              {i + 1} / {images.length}
            </span>
          </>
        )}

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {moreLabel ?? "More photos"}
          </a>
        )}
      </div>

      {/* Thumbnail strip */}
      {multi && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors " +
                (idx === i ? "border-slate-900" : "border-transparent hover:border-slate-300")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
