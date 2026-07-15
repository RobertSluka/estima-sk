"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Building2,
  ChevronDown,
  User,
  LogOut,
  LogIn,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { currentUser } from "@/lib/user"

export default function Navbar() {
  const { lang, setLang, t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the user menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  return (
    <header className="w-full border-b border-slate-200 bg-white h-12 flex items-center pl-14 pr-3 md:px-5 shrink-0">
      {/* Logo + nav links — centered (left padding on mobile clears the
          sidebar's fixed hamburger button) */}
      <div className="flex items-center gap-6 mx-auto">
        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 group-hover:bg-slate-700 transition-colors">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Estima<span className="text-emerald-600">.sk</span>
          </span>
        </Link>

        {/* Marketing links only — app pages live in the sidebar (CZ layout).
            On mobile they move into the user menu below. */}
        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/engine"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            {t("navbar.engine")}
          </Link>
          <Link
            href="/trh"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            {t("navbar.market")}
          </Link>
          <Link
            href="/cennik"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            {t("navbar.pricing")}
          </Link>
          <Link
            href="/kupa-alebo-prenajom"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            {t("navbar.buyRent")}
          </Link>
          <Link
            href="/kontakt"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            {t("navbar.contact")}
          </Link>
        </nav>
      </div>

      {/* Right side: language + user */}
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center rounded-md border border-slate-200 overflow-hidden">
          {(["sk", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={
                "text-[11px] font-semibold px-2 py-1 transition-colors " +
                (lang === l
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-900")
              }
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={
              "flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2 transition-colors " +
              (menuOpen
                ? "border-slate-300 bg-slate-50"
                : "border-transparent hover:bg-slate-50")
            }
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-700 select-none">
              {currentUser.initials}
            </div>
            <span className="text-sm text-slate-700 font-medium hidden sm:block">
              {currentUser.name.split(" ")[0]}
            </span>
            <ChevronDown
              className={
                "h-3.5 w-3.5 text-slate-400 transition-transform " +
                (menuOpen ? "rotate-180" : "")
              }
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
              </div>

              {/* Mobile: the marketing links hidden from the top bar */}
              <div className="md:hidden">
                <div className="my-1.5 h-px bg-slate-100" />
                {(
                  [
                    ["/engine", "navbar.engine"],
                    ["/trh", "navbar.market"],
                    ["/cennik", "navbar.pricing"],
                    ["/kupa-alebo-prenajom", "navbar.buyRent"],
                    ["/kontakt", "navbar.contact"],
                  ] as const
                ).map(([href, key]) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {t(key)}
                  </Link>
                ))}
              </div>

              <div className="my-1.5 h-px bg-slate-100" />

              <Link
                href="/prihlasenie"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogIn className="h-4 w-4 text-slate-400" />
                {t("navbar.signIn")}
              </Link>
              <Link
                href="/cennik"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-4 w-4 text-slate-400" />
                {t("navbar.account")}
              </Link>

              <div className="my-1.5 h-px bg-slate-100" />

              <Link
                href="/prihlasenie"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t("navbar.signOut")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
