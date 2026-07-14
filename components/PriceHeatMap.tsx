"use client"

// ─── PriceHeatMap ────────────────────────────────────────────────────────────
// Okres-level heat view for /mapa-cien: one circle per okres, positioned at
// the centroid of its member listings, sized by supply and coloured by the
// active layer's metric (quantile-normalized so a single outlier okres cannot
// wash out the scale). Bazoš locations are town centroids, so an okres circle
// is the honest granularity — per-listing heat would just stack pins.
//
// Rendered client-only (dynamic import with ssr:false on the page) because
// Leaflet touches `window` at module load.

import "leaflet/dist/leaflet.css"

import { useEffect, useMemo, useRef } from "react"
import { MapContainer, TileLayer, ZoomControl, CircleMarker, Tooltip, useMap } from "react-leaflet"
import L from "leaflet"
import { formatNumber } from "@/lib/utils"

// Geographic centre of Slovakia — the whole country fits at zoom 8.
const SLOVAKIA: [number, number] = [48.68, 19.7]

// Cool → hot, matching the barometer's band palette.
const HEAT_COLORS = ["#0ea5e9", "#14b8a6", "#f59e0b", "#f97316", "#f43f5e"]

export interface DistrictHeatRow {
  district: string
  region: string | null
  count: number
  /** Metric under the active layer; null renders as neutral grey. */
  value: number | null
  /** Formatted metric for tooltips/rail, e.g. "2 905 €/m²". */
  display: string
  lat: number
  lon: number
}

export function heatColor(value: number | null, min: number, max: number): string {
  if (value == null) return "#94a3b8"
  if (max <= min) return HEAT_COLORS[2]
  const norm = (value - min) / (max - min)
  const idx = Math.min(HEAT_COLORS.length - 1, Math.floor(norm * HEAT_COLORS.length))
  return HEAT_COLORS[idx]
}

// Fits the view to the data once per mount, after layout has settled — an
// initial `bounds` prop can fire while the container still has zero size,
// which collapses the view to zoom 0 (the whole world). Layer switches keep
// the user's pan/zoom; a deal-type switch remounts the map and refits.
function FitToData({ rows }: { rows: DistrictHeatRow[] }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (fitted.current || rows.length === 0) return
    fitted.current = true
    // Defer one frame: the effect can fire before the container is measured,
    // and fitting into a 0×0 box degenerates to max zoom. maxZoom caps the
    // fit for sparse data so it can never dive to street level.
    const frame = requestAnimationFrame(() => {
      map.invalidateSize()
      map.fitBounds(
        L.latLngBounds(rows.map((r) => [r.lat, r.lon] as [number, number])),
        { padding: [32, 32], maxZoom: 9 },
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [map, rows])
  return null
}

export default function PriceHeatMap({
  rows,
  selected,
  onSelect,
}: {
  rows: DistrictHeatRow[]
  selected: string | null
  onSelect: (district: string | null) => void
}) {
  // Scale bounds from the 5th–95th percentile so one extreme okres doesn't
  // flatten every other circle into the same colour bucket.
  const [min, max] = useMemo(() => {
    const vals = rows
      .map((r) => r.value)
      .filter((v): v is number => v != null)
      .sort((a, b) => a - b)
    if (vals.length === 0) return [0, 1]
    const q = (p: number) => vals[Math.min(vals.length - 1, Math.floor(p * vals.length))]
    return [q(0.05), Math.max(q(0.95), q(0.05) + 1e-9)]
  }, [rows])

  const maxCount = useMemo(
    () => Math.max(1, ...rows.map((r) => r.count)),
    [rows],
  )

  return (
    <MapContainer
      center={SLOVAKIA}
      zoom={8}
      zoomControl={false}
      className="h-full w-full rounded-2xl"
      scrollWheelZoom
    >
      <FitToData rows={rows} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      {rows.map((r) => (
        <CircleMarker
          key={r.district}
          center={[r.lat, r.lon]}
          radius={10 + 22 * Math.sqrt(r.count / maxCount)}
          pathOptions={{
            color: selected === r.district ? "#0f172a" : "white",
            weight: selected === r.district ? 2.5 : 1.5,
            fillColor: heatColor(r.value, min, max),
            fillOpacity: 0.75,
          }}
          eventHandlers={{
            click: () => onSelect(selected === r.district ? null : r.district),
          }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            <div className="text-xs">
              <p className="font-semibold">{r.district}</p>
              <p>{r.display}</p>
              <p className="text-slate-500">{formatNumber(r.count)}×</p>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
