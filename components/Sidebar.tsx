"use client"

import { useState } from "react"
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
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { currentUser } from "@/lib/user"

type NavItem = {
  href: string
  icon: LucideIcon
  key: string
  badge?: string
  locked?: boolean
}

// Mirrors the CZ (byteval) sidebar — same items in the same order. All pages
// exist for SK; `locked` stays supported for future gated features.
const navItems: NavItem[] = [
  { href: "/inzeraty", icon: Search, key: "nav.search" },
  { href: "/ulozene", icon: Heart, key: "nav.saved" },
  { href: "/odhad", icon: DollarSign, key: "nav.valuations", badge: "••••" },
  { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { href: "/mapa-cien", icon: Map, key: "nav.priceMap" },
  { href: "/barometer", icon: Gauge, key: "nav.barometer" },
  { href: "/prilezitosti", icon: Star, key: "nav.opportunities" },
  { href: "/portfolio", icon: Briefcase, key: "nav.portfolio" },
  { href: "/analyzy", icon: LineChart, key: "nav.analyses" },
  { href: "/zlavy", icon: TrendingDown, key: "nav.priceDrops" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const [mode, setMode] = useState<"basic" | "pro">("basic")

  return (
    <aside
      className={cn(
        "relative flex flex-col shrink-0 bg-[#111113] transition-all duration-200 overflow-visible",
        collapsed ? "w-[52px]" : "w-[148px]"
      )}
    >
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
                  {item.badge && !item.locked && (
                    <span className="text-[9px] text-gray-600">{item.badge}</span>
                  )}
                </>
              )}
            </Link>
          )
        })}
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

      {/* User */}
      <Link
        href="/prihlasenie"
        className={cn(
          "flex items-center gap-2 px-2 py-2.5 border-t border-white/5 shrink-0 hover:bg-white/5 transition-colors",
          collapsed && "justify-center"
        )}
      >
        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-[11px] text-white font-semibold shrink-0">
          {currentUser.initials}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[10px] text-gray-300 font-medium truncate">
              {currentUser.name}
            </p>
            <p className="text-[8px] text-gray-600 uppercase tracking-wider">
              {mode === "pro" ? t("nav.planPro") : t("nav.planBasic")}
            </p>
          </div>
        )}
      </Link>
    </aside>
  )
}
