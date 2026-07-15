"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  Heart,
  DollarSign,
  LayoutDashboard,
  Map,
  Gauge,
  Star,
  Briefcase,
  LineChart,
  TrendingDown,
  Lock,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

type NavItem = {
  href: string
  icon: LucideIcon
  key: string
  badge?: string
  locked?: boolean
}

// Mirrors the CZ (byteval) sidebar — same items in the same order. Locked
// items are CZ features not yet ported/backed for SK; they render as
// visible-but-disabled so the product shape matches the CZ version.
const navItems: NavItem[] = [
  { href: "/inzeraty", icon: Search, key: "nav.search" },
  { href: "/ulozene", icon: Heart, key: "nav.saved", locked: true },
  { href: "/odhad", icon: DollarSign, key: "nav.valuations", badge: "••••" },
  { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard", locked: true },
  { href: "/mapa-cien", icon: Map, key: "nav.priceMap" },
  { href: "/barometer", icon: Gauge, key: "nav.barometer" },
  { href: "/prilezitosti", icon: Star, key: "nav.opportunities", locked: true },
  { href: "/portfolio", icon: Briefcase, key: "nav.portfolio", locked: true },
  { href: "/analyzy", icon: LineChart, key: "nav.analyses", locked: true },
  { href: "/zlavy", icon: TrendingDown, key: "nav.priceDrops", locked: true },
]

// Marketing links — shown inline in the navbar on desktop; folded into the
// mobile drawer so small screens can still reach them.
const marketingItems: { href: string; key: string }[] = [
  { href: "/engine", key: "navbar.engine" },
  { href: "/trh", key: "navbar.market" },
  { href: "/cennik", key: "navbar.pricing" },
  { href: "/kupa-alebo-prenajom", key: "navbar.buyRent" },
  { href: "/kontakt", key: "navbar.contact" },
]

// The sidebar surface itself — shared between the persistent desktop rail
// and the mobile overlay drawer (where `collapsed` is always false and
// `showMarketing` is true).
function SidebarBody({
  collapsed,
  showMarketing,
  mode,
  setMode,
}: {
  collapsed: boolean
  showMarketing?: boolean
  mode: "basic" | "pro"
  setMode: (m: "basic" | "pro") => void
}) {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <>
      {/* Mode tabs */}
      {!collapsed && (
        <div className="flex border-b border-white/10 shrink-0">
          {(["basic", "pro"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors",
                mode === m ? "text-white" : "text-gray-600 hover:text-gray-400"
              )}
            >
              {m === "basic" ? "BASIC" : "PRO"}
            </button>
          ))}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.key}
              href={item.locked ? "#" : item.href}
              aria-disabled={item.locked}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium transition-colors select-none",
                collapsed ? "justify-center" : "",
                active ? "text-white" : "text-gray-500 hover:text-gray-200",
                item.locked && "opacity-40 pointer-events-none"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{t(item.key)}</span>
                  {item.locked && (
                    <Lock className="h-2.5 w-2.5 shrink-0 text-gray-600" />
                  )}
                </>
              )}
            </Link>
          )
        })}

        {/* Marketing links (mobile drawer only) */}
        {showMarketing && (
          <div className="mt-1 border-t border-white/10 pt-1">
            {marketingItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 text-[11px] font-medium text-gray-500 hover:text-gray-200 transition-colors select-none"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Upgrade CTA */}
      <div className="px-2 pb-2 shrink-0 border-t border-white/5 pt-2">
        {collapsed ? (
          <div className="flex justify-center">
            <Star className="h-3.5 w-3.5 text-yellow-500" />
          </div>
        ) : (
          <Link
            href="/cennik"
            className="w-full bg-white text-black text-[9px] font-bold py-2 px-2 rounded flex items-center justify-between leading-none"
          >
            <span>{t("nav.upgrade")}</span>
            <span className="text-gray-500">9,90 €</span>
          </Link>
        )}
      </div>

      {/* Sign in — no auth backend yet, so the app is always signed out. */}
      <Link
        href="/prihlasenie"
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 border-t border-white/5 shrink-0 text-gray-400 hover:text-white hover:bg-white/5 transition-colors",
          collapsed && "justify-center px-0"
        )}
      >
        <LogIn className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <span className="text-[11px] font-medium">{t("navbar.signIn")}</span>
        )}
      </Link>
    </>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const [mode, setMode] = useState<"basic" | "pro">("basic")
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close the drawer whenever navigation happens (a nav link was tapped).
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll behind the open drawer.
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile: hamburger over the navbar's left edge (the rail is hidden). */}
      <button
        type="button"
        aria-label={t("nav.menu")}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-2 z-40 flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-black/55"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[240px] flex-col bg-[#111113] shadow-2xl">
            <button
              type="button"
              aria-label={t("nav.closeMenu")}
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarBody collapsed={false} showMarketing mode={mode} setMode={setMode} />
          </aside>
        </div>
      )}

      {/* Desktop: persistent rail */}
      <aside
        className={cn(
          "relative hidden md:flex flex-col shrink-0 bg-[#111113] transition-all duration-200 overflow-visible",
          collapsed ? "w-[52px]" : "w-[148px]"
        )}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#111113] border border-white/10 text-gray-500 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        <SidebarBody collapsed={collapsed} mode={mode} setMode={setMode} />
      </aside>
    </>
  )
}
