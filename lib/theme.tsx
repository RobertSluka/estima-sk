"use client"

// Light/dark theme state, mirroring the lib/i18n pattern: localStorage-backed,
// applied as a `dark` class on <html> (Tailwind darkMode: "class"). The
// pre-hydration snippet in app/layout.tsx sets the class before first paint;
// this provider only keeps React state in sync afterwards.

import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "estima-sk.theme"

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")

  // Initial state comes from the <html> class the layout snippet already set —
  // reading localStorage here again would race with SSR hydration.
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setThemeState("dark")
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    document.documentElement.classList.toggle("dark", t === "dark")
    window.localStorage.setItem(THEME_STORAGE_KEY, t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
