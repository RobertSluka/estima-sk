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
}

module.exports = nextConfig
