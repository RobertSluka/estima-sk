import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import Footer from "@/components/Footer"
import { LanguageProvider } from "@/lib/i18n"
import { ThemeProvider } from "@/lib/theme"

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" })

// Runs before paint so a saved dark preference never flashes light first.
const themeInitScript = `try{if(localStorage.getItem("estima-sk.theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`

export const metadata: Metadata = {
  title: "Estima — realitná inteligencia pre slovenský trh",
  description:
    "Orientačný odhad ceny nehnuteľnosti, kalkulačka kúpa vs nájom a trhové prehľady pre Slovensko.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={inter.variable} suppressHydrationWarning>
      {/* App shell: dark sidebar on the left, navbar on top, scrollable main. */}
      <body className="h-screen overflow-hidden flex font-sans bg-[#111113]">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <LanguageProvider>
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-y-auto bg-page flex flex-col">
                <div className="flex-1">{children}</div>
                <Footer />
              </main>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
