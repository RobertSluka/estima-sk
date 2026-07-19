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
  // Estima Academy is rendered by the report-service (api.estima.sk). Proxy it
  // under this origin so it lives at estima.sk/academy — the page's own navbar
  // uses relative links, so serving it cross-origin trapped users on the api
  // subdomain with no way back. The URL bar stays on estima.sk.
  async rewrites() {
    return [
      { source: "/academy", destination: "https://api.estima.sk/academy" },
      { source: "/academy/download", destination: "https://api.estima.sk/academy/download" },
    ]
  },
}

module.exports = nextConfig
