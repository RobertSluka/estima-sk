"use client"

import Link from "next/link"
import { Building2, LogIn, LogOut, Moon, Sun } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useTheme } from "@/lib/theme"
import { useSession, logout } from "@/lib/user"

export default function Navbar() {
  const { lang, setLang, t } = useI18n()
  const { theme, setTheme } = useTheme()
  const session = useSession()

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
            On mobile they move into the sidebar drawer. */}
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

      {/* Right side: language + session. The identity comes from the session
          cookie (lib/user.ts) — signed-out UI until it says otherwise. */}
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

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

        {session.authenticated && session.user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white select-none">
                {session.user.name[0]}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                {t("navbar.roleAdmin")}
              </span>
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">{t("navbar.signOut")}</span>
            </button>
          </div>
        ) : (
          <Link
            href="/prihlasenie"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t("navbar.signIn")}</span>
          </Link>
        )}
      </div>
    </header>
  )
}
