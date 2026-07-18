"use client"

// Interactive Leaflet map with toggleable "what's nearby" POI layers.
// POIs come from the OpenStreetMap Overpass API (free, no key) within RADIUS
// metres of the listing. Rendered client-only (see dynamic import in the
// property page) because Leaflet touches `window` at module load.
//
// Two views share one POI fetch + one set of category toggles:
//   • inline   — chips + map + nearby list (always mounted)
//   • expanded — full-screen map + AMENITIES checklist + Map/Satellite toggle
//                (rendered when the `expanded` prop is true)

import "leaflet/dist/leaflet.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet"
import L from "leaflet"
import {
  ShoppingCart,
  GraduationCap,
  Utensils,
  Bus,
  Stethoscope,
  Trees,
  Maximize,
  RotateCw,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

const RADIUS = 1000 // metres

// The public Overpass instance rate-limits under load; fall back across mirrors.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
]

type CatId = "transit" | "groceries" | "restaurants" | "schools" | "health" | "leisure"

interface CatDef {
  id: CatId
  labelKey: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}

const CATS: CatDef[] = [
  { id: "transit", labelKey: "property.transit", color: "#2563eb", icon: Bus },
  { id: "groceries", labelKey: "property.groceries", color: "#059669", icon: ShoppingCart },
  { id: "restaurants", labelKey: "property.restaurants", color: "#ea580c", icon: Utensils },
  { id: "schools", labelKey: "property.schools", color: "#7c3aed", icon: GraduationCap },
  { id: "health", labelKey: "property.health", color: "#dc2626", icon: Stethoscope },
  { id: "leisure", labelKey: "property.leisure", color: "#0d9488", icon: Trees },
]
const ALL_CATS = CATS.map((c) => c.id)

const GROCERY = new Set(["supermarket", "convenience", "greengrocer"])
const RESTAURANT = new Set(["restaurant", "cafe", "fast_food", "bar", "pub", "food_court"])
const SCHOOL = new Set(["school", "kindergarten", "university", "college"])
const HEALTH = new Set(["pharmacy", "doctors", "clinic", "hospital", "dentist"])
const LEISURE = new Set([
  "park",
  "fitness_centre",
  "sports_centre",
  "playground",
  "pitch",
  "swimming_pool",
  "garden",
])
const LEISURE_AMENITY = new Set(["cinema", "theatre"])

interface Poi {
  id: string
  lat: number
  lon: number
  name: string // "" when OSM has no name — rendered as t(`poi.${type}`)
  type: string
  cat: CatId
  dist: number
}

// Pick which category an OSM element belongs to. Order matters (a "supermarket"
// is a grocery, not a generic shop).
function classify(tags: Record<string, string>): CatId | null {
  const { shop, amenity, leisure } = tags
  if (shop && GROCERY.has(shop)) return "groceries"
  if (amenity && RESTAURANT.has(amenity)) return "restaurants"
  if (amenity && SCHOOL.has(amenity)) return "schools"
  if (amenity && HEALTH.has(amenity)) return "health"
  if (
    tags.highway === "bus_stop" ||
    tags.railway === "tram_stop" ||
    tags.railway === "station" ||
    tags.railway === "subway_entrance" ||
    tags.railway === "halt" ||
    tags.public_transport === "station"
  )
    return "transit"
  if (leisure && LEISURE.has(leisure)) return "leisure"
  if (amenity && LEISURE_AMENITY.has(amenity)) return "leisure"
  return null
}

function haversine(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371000
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLon = ((bLon - aLon) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function fmtDist(m: number): string {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`
}

function buildQuery(lat: number, lon: number): string {
  const a = `(around:${RADIUS},${lat},${lon})`
  return (
    `[out:json][timeout:25];(` +
    `nwr["shop"~"^(supermarket|convenience|greengrocer)$"]${a};` +
    `nwr["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court|school|kindergarten|university|college|pharmacy|doctors|clinic|hospital|dentist|cinema|theatre)$"]${a};` +
    `nwr["leisure"~"^(park|fitness_centre|sports_centre|playground|pitch|swimming_pool|garden)$"]${a};` +
    `node["highway"="bus_stop"]${a};` +
    `node["railway"~"^(tram_stop|station|subway_entrance|halt)$"]${a};` +
    `node["public_transport"="station"]${a};` +
    `);out center 300;`
  )
}

// ── Marker icons ─────────────────────────────────────────────────────────────
// Emerald teardrop for the property; small colored teardrops per category.
function teardrop(color: string, size: number, ring = "#fff") {
  const h = size
  const w = size
  return L.divIcon({
    className: "",
    iconSize: [w, h],
    iconAnchor: [w / 2, h - 2],
    popupAnchor: [0, -h + 6],
    html: `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="${color}" stroke="${ring}" stroke-width="1.5" style="filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35))"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.4" fill="#fff" stroke="none"/></svg>`,
  })
}
// Small, unobtrusive dot for the property itself (keeps the map clean).
// Steel — the "you are here" marker is an active state, not a semantic gain.
const propertyIcon = L.divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9],
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#5b7ba6;border:3px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
})
const catIcon = Object.fromEntries(
  CATS.map((c) => [c.id, teardrop(c.color, 22)]),
) as Record<CatId, L.DivIcon>

// Shared marker layer for both inline and expanded maps. Unnamed POIs get a
// generic per-type label, resolved at render time so it follows the language.
function PoiMarkers({ pois }: { pois: Poi[] }) {
  const { t } = useI18n()
  return (
    <>
      {pois.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lon]} icon={catIcon[p.cat]}>
          <Tooltip direction="top" offset={[0, -16]}>
            <span className="font-medium">{p.name || t(`poi.${p.type}`)}</span> · {fmtDist(p.dist)}
          </Tooltip>
        </Marker>
      ))}
    </>
  )
}

export default function PropertyMap({
  lat,
  lon,
  label,
  expanded = false,
  onExpand,
  onClose,
}: {
  lat: number
  lon: number
  label: string
  expanded?: boolean
  onExpand?: () => void
  onClose?: () => void
}) {
  const { t } = useI18n()
  const [pois, setPois] = useState<Poi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // Start with everything off so the map is clean; the user opts into layers.
  const [enabled, setEnabled] = useState<Set<CatId>>(() => new Set<CatId>())
  const [basemap, setBasemap] = useState<"map" | "sat">("map")

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      setError(false)
      const body = "data=" + encodeURIComponent(buildQuery(lat, lon))
      // Try each mirror in turn; only give up (error) once all have failed.
      for (const url of OVERPASS_ENDPOINTS) {
        try {
          const res = await fetch(url, { method: "POST", body, signal })
          if (!res.ok) throw new Error(String(res.status))
          const data = await res.json()
          const seen = new Set<string>()
          const out: Poi[] = []
          for (const el of data.elements ?? []) {
            const tags = el.tags ?? {}
            const cat = classify(tags)
            if (!cat) continue
            const pLat = el.lat ?? el.center?.lat
            const pLon = el.lon ?? el.center?.lon
            if (pLat == null || pLon == null) continue
            const name = tags.name || tags["name:en"] || tags.brand || ""
            const type =
              tags.shop || tags.amenity || tags.leisure || tags.railway || tags.highway || "stop"
            // Named POIs dedup on name+lat (OSM often maps one place as both a
            // node and a building way); unnamed ones dedup on position only so
            // two distinct unnamed stops/playgrounds both survive.
            const key = name
              ? `${cat}:${name}:${Math.round(pLat * 1e4)}`
              : `${cat}:${type}:${Math.round(pLat * 1e4)}:${Math.round(pLon * 1e4)}`
            if (seen.has(key)) continue
            seen.add(key)
            out.push({
              id: String(el.type[0] + el.id),
              lat: pLat,
              lon: pLon,
              name,
              type,
              cat,
              dist: haversine(lat, lon, pLat, pLon),
            })
          }
          out.sort((a, b) => a.dist - b.dist)
          setPois(out)
          setLoading(false)
          return
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return
          // otherwise fall through and try the next mirror
        }
      }
      setError(true)
      setLoading(false)
    },
    [lat, lon],
  )

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 20000)
    load(ctrl.signal).finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [load])

  // Lock body scroll while the expanded overlay is open.
  useEffect(() => {
    if (!expanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [expanded, onClose])

  const counts = useMemo(() => {
    const c = Object.fromEntries(ALL_CATS.map((id) => [id, 0])) as Record<CatId, number>
    for (const p of pois) c[p.cat]++
    return c
  }, [pois])

  const visible = useMemo(() => pois.filter((p) => enabled.has(p.cat)), [pois, enabled])

  function toggle(id: CatId) {
    setEnabled((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Muted light-grey base map (CARTO Positron) — matches the map style used
  // across the app and keeps the light map soft against the dark UI.
  const mapTile = (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
      subdomains="abcd"
    />
  )

  return (
    <div>
      {/* Inline preview — a clean, non-interactive map. All amenity filtering
          lives in the expanded view to keep this small map uncluttered.
          Hidden while expanded so its Leaflet panes don't bleed over the overlay. */}
      {!expanded && (
        <div className="relative">
          <MapContainer
            center={[lat, lon]}
            zoom={15}
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            zoomControl={false}
            style={{ height: "340px", width: "100%" }}
          >
            {mapTile}
            <Marker position={[lat, lon]} icon={propertyIcon}>
              <Popup>{label}</Popup>
            </Marker>
          </MapContainer>
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="absolute top-3 left-3 z-[500] inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-white transition-colors"
            >
              <Maximize className="h-4 w-4" />
              {t("property.exploreNearby")}
            </button>
          )}
        </div>
      )}

      {/* ── Expanded full-screen view ─────────────────────────────────────── */}
      {expanded && (
        <div className="fixed inset-0 z-[1000] bg-white">
          <MapContainer
            center={[lat, lon]}
            zoom={15}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
            zoomControl
          >
            {basemap === "map" ? (
              mapTile
            ) : (
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}
            <Marker position={[lat, lon]} icon={propertyIcon}>
              <Popup>{label}</Popup>
            </Marker>
            <PoiMarkers pois={visible} />
          </MapContainer>

          {/* Map / Satellite toggle (top-left) */}
          <div className="absolute top-4 left-4 z-[1000] flex rounded-lg bg-white shadow-md overflow-hidden text-sm font-medium">
            <button
              onClick={() => setBasemap("map")}
              className={cn("px-3 py-2", basemap === "map" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}
            >
              {t("property.mapView")}
            </button>
            <button
              onClick={() => setBasemap("sat")}
              className={cn("px-3 py-2", basemap === "sat" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}
            >
              {t("property.satellite")}
            </button>
          </div>

          {/* Close (top-right) */}
          <button
            onClick={onClose}
            aria-label={t("property.closeMap")}
            className="absolute top-4 right-4 z-[1000] inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-md hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Amenities checklist (top-right, below close) */}
          <div className="absolute top-16 right-4 z-[1000] w-60 rounded-xl bg-white shadow-lg border border-slate-200 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              {t("property.amenities")}
            </p>
            <ul className="space-y-0.5">
              {CATS.map((c) => {
                const on = enabled.has(c.id)
                return (
                  <li key={c.id}>
                    <label className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(c.id)}
                        className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                        style={{ accentColor: c.color }}
                      />
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-sm text-slate-700 flex-1">{t(c.labelKey)}</span>
                      <span className="text-xs text-slate-400 tabular-nums">({counts[c.id]})</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {loading ? (
              <p className="text-xs text-slate-400 mt-2 px-1 border-t border-slate-100 pt-2">
                {t("property.loadingPlaces")}
              </p>
            ) : error ? (
              <div className="mt-2 px-1 border-t border-slate-100 pt-2">
                <p className="text-xs text-slate-400">{t("property.placesError")}</p>
                <button
                  onClick={() => load()}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  {t("property.retry")}
                </button>
              </div>
            ) : (
              pois.length === 0 && (
                <p className="text-xs text-slate-400 mt-2 px-1 border-t border-slate-100 pt-2">
                  {t("property.noPlaces")}
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
