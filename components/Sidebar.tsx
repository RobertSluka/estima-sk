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
import { useSession } from "@/lib/user"

type NavItem = {
  href: string
  icon: LucideIcon
  key: string
  badge?: string
  locked?: boolean
}

// Mirrors the CZ (byteval) sidebar — same items in the same order. Locked
// items are gated for the public site; an authenticated admin session
// unlocks all of them (the pages exist and work).
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
  const session = useSession()

  return (
    <>
      {/* Mode tabs — active tab carries a steel underline, not a bright fill */}
      {!collapsed && (
        <div className="flex border-b border-steel/15 shrink-0">
          {(["basic", "pro"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2.5 -mb-px border-b-2 text-[10px] font-bold tracking-widest uppercase transition-colors",
                mode === m
                  ? "border-steel text-[#F4F6F8]"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              )}
            >
              {m === "basic" ? "BASIC" : "PRO"}
            </button>
          ))}
        </div>
      )}

      {/* Nav items — active: subtle steel fill + hairline ring, no bright block */}
      <nav className="flex-1 py-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const locked = Boolean(item.locked) && !session.authenticated
          const active = pathname === item.href
          return (
            <Link
              key={item.key}
              href={locked ? "#" : item.href}
              aria-disabled={locked}
              className={cn(
                "mx-1.5 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[11px] font-medium transition-colors select-none",
                collapsed ? "justify-center" : "",
                active
                  ? "bg-steel/15 text-[#F4F6F8] ring-1 ring-inset ring-steel/30"
                  : "text-gray-300 hover:bg-[#ffffff08] hover:text-[#F4F6F8]",
                locked && "opacity-40 pointer-events-none"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  active ? "text-steel-strong" : "text-gray-400"
                )}
              />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{t(item.key)}</span>
                  {locked && (
                    <Lock className="h-2.5 w-2.5 shrink-0 text-gray-500" />
                  )}
                </>
              )}
            </Link>
          )
        })}

        {/* Marketing links (mobile drawer only) */}
        {showMarketing && (
          <div className="mt-1 border-t border-steel/15 pt-1">
            {marketingItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mx-1.5 my-0.5 flex items-center rounded-md px-2.5 py-2 text-[11px] font-medium text-gray-300 hover:bg-[#ffffff08] hover:text-[#F4F6F8] transition-colors select-none"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Upgrade CTA — the one deliberately white-filled action in the rail */}
      <div className="px-2 pb-2 shrink-0 border-t border-steel/10 pt-2">
        {collapsed ? (
          <div className="flex justify-center">
            <Star className="h-3.5 w-3.5 text-steel" />
          </div>
        ) : (
          <Link
            href="/cennik"
            className="w-full bg-[#F4F6F8] text-[#0B111C] text-[9px] font-bold py-2 px-2.5 rounded-md flex items-center justify-between leading-none transition-colors hover:bg-[#ffffff]"
          >
            <span>{t("nav.upgrade")}</span>
            <span className="text-[#6F7B8D]">9,90 €</span>
          </Link>
        )}
      </div>

      {/* Session footer: admin identity when signed in, sign-in link otherwise. */}
      {session.authenticated && session.user ? (
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 border-t border-steel/10 shrink-0",
            collapsed && "justify-center px-0"
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#243149] text-[11px] font-semibold text-[#F4F6F8] shrink-0">
            {session.user.name[0]}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-gray-300 truncate">
                {session.user.name}
              </p>
              <p className="text-[8px] uppercase tracking-wider text-steel-strong">
                {t("navbar.roleAdmin")}
              </p>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/prihlasenie"
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 border-t border-steel/10 shrink-0 text-gray-400 hover:text-[#F4F6F8] hover:bg-[#ffffff08] transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <LogIn className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="text-[11px] font-medium">{t("navbar.signIn")}</span>
          )}
        </Link>
      )}
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
          <aside className="absolute left-0 top-0 flex h-full w-[240px] flex-col bg-sidebar shadow-2xl">
            <button
              type="button"
              aria-label={t("nav.closeMenu")}
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:text-[#ffffff]"
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
          "relative hidden md:flex flex-col shrink-0 bg-sidebar transition-all duration-200 overflow-visible",
          collapsed ? "w-[52px]" : "w-[148px]"
        )}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-sidebar border border-steel/25 text-gray-400 hover:text-[#F4F6F8] transition-colors"
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
