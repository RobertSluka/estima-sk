"use client"

// ─── ListingsMap ─────────────────────────────────────────────────────────────
// OpenStreetMap tile map (Leaflet) showing the filtered listings as clustered,
// navigable EUR price pins. Bazoš carries only town-level locations, so pins
// sit on town centroids and same-town listings stack — clustering is essential.
//
// Rendered client-only (dynamic import with ssr:false on the listings page)
// because Leaflet touches `window` at module load.

import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

import { useEffect, useMemo, useRef, useState } from "react"
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Maximize2, Minimize2, PanelRightClose } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import type { Listing } from "@/lib/api"

// leaflet.markercluster ships a UMD build that references a *global* `L`. In our
// bundled ESM context there is no global, so expose Leaflet on `window` first,
// then load the plugin (it augments `L` with `markerClusterGroup`). This file is
// only ever loaded client-side (dynamic import, ssr:false), so `window` exists.
if (typeof window !== "undefined") {
  ;(window as unknown as { L: typeof L }).L = L
  require("leaflet.markercluster")
}

// Geographic centre of Slovakia — the whole country fits at zoom 8.
const SLOVAKIA: [number, number] = [48.68, 19.7]

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

// Compact EUR price for a pin label: "195k" for sale, "550 €" for rent.
function compactPrice(l: Listing): string {
  if (l.price == null) return "—"
  if (l.dealType === "rent") return `${Math.round(l.price)} €`
  return l.price >= 1_000_000
    ? `${(l.price / 1_000_000).toFixed(1)}M`
    : `${Math.round(l.price / 1000)}k`
}

// A single price pin. `active` = hovered or selected → dark fill.
function priceIcon(label: string, active: boolean): L.DivIcon {
  const bg = active ? "#0f172a" : "#ffffff"
  const fg = active ? "#ffffff" : "#0f172a"
  const border = active ? "#0f172a" : "#cbd5e1"
  const z = active ? "z-index:1000;" : ""
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<div style="${z}position:absolute;transform:translate(-50%,-50%);
      display:inline-flex;align-items:center;justify-content:center;
      padding:2px 7px;border-radius:9999px;border:1.5px solid ${border};
      background:${bg};color:${fg};font:600 11px/1.2 ui-sans-serif,system-ui;
      box-shadow:0 1px 3px rgba(0,0,0,.25);white-space:nowrap;cursor:pointer;">${label}</div>`,
  })
}

// Dark, semi-transparent slate count bubble for clusters, sized by child count.
function clusterIcon(count: number): L.DivIcon {
  const size = count < 10 ? 34 : count < 50 ? 40 : count < 200 ? 48 : 56
  const label =
    count >= 1000 ? `${(count / 1000).toFixed(count >= 10_000 ? 0 : 1)}k` : `${count}`
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      background:rgba(15,23,42,.82);color:#fff;font:600 13px ui-sans-serif,system-ui;
      box-shadow:0 2px 8px rgba(15,23,42,.28),inset 0 0 0 1px rgba(255,255,255,.14);
      backdrop-filter:blur(1px);">${label}</div>`,
  })
}

function popupHtml(l: Listing): string {
  const price =
    l.price != null
      ? `${l.price.toLocaleString("sk-SK")} €${l.dealType === "rent" ? "/mes." : ""}`
      : "—"
  const meta = [l.layout, l.floorArea ? `${Math.round(l.floorArea)} m²` : null, l.locality]
    .filter(Boolean)
    .join(" · ")
  return `<div style="font:400 12px ui-sans-serif,system-ui;min-width:150px">
    <div style="font-weight:600;color:#0f172a;margin-bottom:2px">${l.name ?? l.locality ?? "Inzerát"}</div>
    <div style="color:#64748b">${meta}</div>
    <div style="font-weight:700;color:#0f172a;margin:4px 0">${price}</div>
    <a href="/inzeraty/${encodeURIComponent(l.id)}" style="color:#2563eb;font-weight:600">Otvoriť inzerát →</a>
  </div>`
}

// Imperatively manage a marker-cluster layer inside the react-leaflet map.
function ClusterLayer({
  items,
  selectedId,
  onSelect,
}: {
  items: Listing[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const map = useMap()
  const groupRef = useRef<L.MarkerClusterGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const didFitRef = useRef(false)
  // A fit executed while the container had zero size (hidden panel/tab) lands
  // on a world-level zoom; remember the pins and redo it on the first real
  // resize.
  const latlngsRef = useRef<L.LatLng[]>([])
  const validFitRef = useRef(false)

  // The set of listing ids on the map — fit bounds only when this actually
  // changes (filter edits), not on sort or map movement, so we never fight the
  // user's panning. Order-independent so sorting doesn't trigger a refit.
  const idSignature = useMemo(
    () => items.length + ":" + items.reduce((sum, l) => sum + Number(l.id || 0), 0),
    [items],
  )

  // Create the cluster group once, and re-run the fit when the container gets
  // its first real size (a fit done at 0×0 sticks at world zoom).
  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 55,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (c) => clusterIcon(c.getChildCount()),
    })
    groupRef.current = group
    map.addLayer(group)

    const onResize = () => {
      if (validFitRef.current || latlngsRef.current.length === 0) return
      const size = map.getSize()
      if (size.x === 0 || size.y === 0) return
      map.fitBounds(L.latLngBounds(latlngsRef.current).pad(0.12), {
        maxZoom: 13,
        animate: false,
      })
      validFitRef.current = true
    }
    map.on("resize", onResize)

    return () => {
      map.off("resize", onResize)
      map.removeLayer(group)
      groupRef.current = null
    }
  }, [map])

  // Rebuild markers whenever the listing set changes.
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    group.clearLayers()
    markersRef.current.clear()

    const latlngs: L.LatLng[] = []
    for (const l of items) {
      if (l.lat == null || l.lon == null) continue
      const marker = L.marker([l.lat, l.lon], {
        icon: priceIcon(compactPrice(l), l.id === selectedId),
      })
      marker.bindPopup(popupHtml(l))
      marker.on("click", () => onSelect(l.id))
      group.addLayer(marker)
      markersRef.current.set(l.id, marker)
      latlngs.push(L.latLng(l.lat, l.lon))
    }

    // Fit to the new result set once (and on subsequent filter changes). On the
    // first fit the container may not have its final size yet (dynamic import +
    // flex layout), which makes Leaflet compute a world-level zoom — recompute
    // the size right before fitting, after layout settles. If the container is
    // still 0×0 (hidden panel/background tab), the resize handler above redoes
    // the fit as soon as a real size arrives.
    latlngsRef.current = latlngs
    if (latlngs.length > 0) {
      const fit = () => {
        map.invalidateSize()
        const size = map.getSize()
        map.fitBounds(L.latLngBounds(latlngs).pad(0.12), {
          maxZoom: didFitRef.current ? 13 : 9,
          animate: didFitRef.current,
        })
        didFitRef.current = true
        validFitRef.current = size.x > 0 && size.y > 0
      }
      if (didFitRef.current) fit()
      else setTimeout(fit, 200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSignature])

  // Reflect external selection: highlight the pin, reveal it (de-cluster), open
  // its popup.
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    markersRef.current.forEach((marker, id) => {
      const data = items.find((l) => l.id === id)
      if (data) marker.setIcon(priceIcon(compactPrice(data), id === selectedId))
    })
    if (selectedId) {
      const marker = markersRef.current.get(selectedId)
      if (marker) group.zoomToShowLayer(marker, () => marker.openPopup())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  return null
}

// Report the viewport bounds to the parent on every move/zoom (for the
// "search as I move the map" list narrowing).
function BoundsReporter({ onBoundsChange }: { onBoundsChange: (b: MapBounds) => void }) {
  const emit = (map: L.Map) => {
    // A zero-sized container (hidden panel, layout not settled) yields
    // degenerate bounds that would filter the list down to nothing — with
    // "search in view" on by default that would blank the page on load.
    const size = map.getSize()
    if (size.x === 0 || size.y === 0) return
    const b = map.getBounds()
    onBoundsChange({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    })
  }
  const map = useMapEvents({
    moveend: () => emit(map),
    zoomend: () => emit(map),
    // First valid emit once a hidden/zero-sized container gains real size.
    resize: () => emit(map),
  })
  useEffect(() => {
    emit(map)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

// Leaflet caches the container size; when we toggle fullscreen the element
// resizes via CSS, so tell the map to recompute (once the transition settles).
function InvalidateOnResize({ trigger }: { trigger: unknown }) {
  const map = useMap()
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 220)
    return () => clearTimeout(id)
  }, [trigger, map])
  return null
}

export default function ListingsMap({
  items,
  selectedId,
  onSelect,
  onBoundsChange,
  searchInView,
  onSearchInViewChange,
  onCollapse,
}: {
  items: Listing[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onBoundsChange: (b: MapBounds) => void
  searchInView: boolean
  onSearchInViewChange: (v: boolean) => void
  /** Optional: when provided, shows a top-left arrow to hide the map panel. */
  onCollapse?: () => void
}) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  // Close fullscreen on Escape.
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [expanded])

  return (
    <div
      className={cn(
        expanded ? "fixed inset-0 z-[2000] bg-white p-2 sm:p-3" : "relative h-full w-full",
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl">
        <MapContainer
          center={SLOVAKIA}
          zoom={8}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
          style={{ background: "#f2f3f5" }}
        >
          {/* Bottom-left so the top-centre toggle never covers it */}
          <ZoomControl position="bottomleft" />
          {/* CartoDB Positron — clean, light, monochrome basemap.
              detectRetina + {r} for crisp @2x tiles. */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            detectRetina
          />
          <ClusterLayer items={items} selectedId={selectedId} onSelect={onSelect} />
          <BoundsReporter onBoundsChange={onBoundsChange} />
          <InvalidateOnResize trigger={expanded} />
        </MapContainer>

        {/* Hide the map panel — top left (only when a handler is provided) */}
        {onCollapse && !expanded && (
          <button
            type="button"
            onClick={onCollapse}
            title={t("map.hide")}
            aria-label={t("map.hide")}
            className="absolute left-3 top-3 z-[1000] flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-slate-900"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        )}

        {/* "Search as I move the map" toggle — top centre */}
        <label className="absolute left-1/2 top-3 z-[1000] flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
          <input
            type="checkbox"
            checked={searchInView}
            onChange={(e) => onSearchInViewChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-slate-900"
          />
          {t("map.searchInView")}
        </label>

        {/* Expand / collapse to fullscreen — top right */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? t("map.collapse") : t("map.expand")}
          aria-label={expanded ? t("map.collapse") : t("map.expand")}
          className="absolute right-3 top-3 z-[1000] flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-slate-900"
        >
          {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
