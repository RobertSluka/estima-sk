"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Sparkles, ImageOff, AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import type { PhotoCondition } from "@/lib/analyza"

function Note({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700 text-right">{value}</span>
    </div>
  )
}

// Full-screen image viewer. Rendered into document.body via a portal so it
// escapes the card's stacking/overflow context. Closes on Escape or backdrop
// click; arrow keys (and on-screen chevrons) page through the gallery.
function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: string[]
  index: number
  onClose: () => void
  onNavigate: (next: number) => void
}) {
  const { t } = useI18n()

  const step = useCallback(
    (delta: number) => onNavigate((index + delta + images.length) % images.length),
    [index, images.length, onNavigate],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") step(1)
      else if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    // Prevent the page behind the overlay from scrolling.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, step])

  const multiple = images.length > 1

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      {/* Close */}
      <button
        type="button"
        aria-label={t("analyses.photo.close")}
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev */}
      {multiple && (
        <button
          type="button"
          aria-label={t("analyses.photo.prev")}
          onClick={(e) => {
            e.stopPropagation()
            step(-1)
          }}
          className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image (stop propagation so clicking the photo doesn't close) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {/* Next */}
      {multiple && (
        <button
          type="button"
          aria-label={t("analyses.photo.next")}
          onClick={(e) => {
            e.stopPropagation()
            step(1)
          }}
          className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Counter */}
      {multiple && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white tabular-nums">
          {index + 1} / {images.length}
        </div>
      )}
    </div>,
    document.body,
  )
}

export default function PhotoConditionPanel({ photo }: { photo: PhotoCondition }) {
  const { t } = useI18n()
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900">{t("analyses.photo.title")}</h3>
          <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
            {t("analyses.photo.aiTag")}
          </span>
        </div>

        {/* AI notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <Note
            label={t("analyses.photo.interior")}
            value={t(`analyses.level.${photo.interiorCondition}`)}
          />
          <Note
            label={t("analyses.photo.renovation")}
            value={t(`analyses.reno.${photo.renovationLevel}`)}
          />
          <Note
            label={t("analyses.photo.quality")}
            value={t(`analyses.level.${photo.photoQuality}`)}
          />
          <Note
            label={t("analyses.photo.missing")}
            value={
              photo.missingRoom ? t(`analyses.room.${photo.missingRoom}`) : t("analyses.photo.none")
            }
          />
        </div>

        {/* Gallery — every available photo, click to open full size */}
        {photo.imageUrls.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photo.imageUrls.map((url, i) => (
              <button
                key={`${i}-${url}`}
                type="button"
                aria-label={t("analyses.photo.openImage")}
                onClick={() => setLightbox(i)}
                className="group relative overflow-hidden rounded-lg bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 aspect-[4/3] w-full rounded-lg bg-slate-100 flex items-center justify-center">
            <ImageOff className="h-5 w-5 text-slate-300" />
          </div>
        )}

        {photo.lowPhotoRisk && (
          <div className="mt-3 flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[11px] text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {t("analyses.photo.lowPhotoRisk")}
          </div>
        )}
      </CardContent>

      {lightbox !== null && photo.imageUrls[lightbox] && (
        <Lightbox
          images={photo.imageUrls}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      )}
    </Card>
  )
}
