import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import Footer from "@/components/Footer"
import { LanguageProvider } from "@/lib/i18n"

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Estima — realitná inteligencia pre slovenský trh",
  description:
    "Orientačný odhad ceny nehnuteľnosti, kalkulačka kúpa vs nájom a trhové prehľady pre Slovensko.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={inter.variable}>
      {/* App shell: dark sidebar on the left, navbar on top, scrollable main. */}
      <body className="h-screen overflow-hidden flex font-sans bg-[#111113]">
        <LanguageProvider>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-[#f1f2f4] flex flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}
