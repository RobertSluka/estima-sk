/** @type {import('next').NextConfig} */
const nextConfig = {
  // Parallel `next dev` instances (multiple Claude sessions) corrupt each
  // other's webpack cache when they share .next/ — give each its own build
  // dir via NEXT_DIST_DIR (e.g. ".next-3014"). Unset = default ".next".
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Strict mode double-mounts MapContainer in dev, which breaks react-leaflet v4
  // (stale container size → world-level zoom). byteval runs without it too.
  reactStrictMode: false,
  // react-leaflet / @react-leaflet/core ship ESM only — let Next transpile them.
  transpilePackages: ["react-leaflet", "@react-leaflet/core"],
  // The Academy landing + article pages are now native Next routes (app/academy).
  // Only the PDF export stays on the report-service, proxied so the download
  // link can live under estima.sk without exposing the api subdomain.
  async rewrites() {
    return [
      { source: "/academy/download", destination: "https://api.estima.sk/academy/download" },
    ]
  },
  // Estima Engine is now the landing page at "/" (app/page.tsx). Keep the old
  // /engine URL working for existing links and bookmarks.
  async redirects() {
    return [{ source: "/engine", destination: "/", permanent: true }]
  },
}

module.exports = nextConfig
