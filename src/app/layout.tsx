import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Comparativo EV Portugal",
    template: "%s · Comparativo EV Portugal",
  },
  description:
    "Compare carros elétricos no mercado português: autonomia, potência, equipamento, conforto e custo por ponto. Dez critérios, uma decisão.",
  applicationName: "Comparativo EV Portugal",
  icons: {
    icon: [
      {
        url: "/comparativo-ev-portugal-icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/comparativo-ev-portugal-icon.svg",
    apple: "/comparativo-ev-portugal-icon.svg",
  },
  manifest: "/manifest.webmanifest",
  keywords: [
    "carros elétricos",
    "EV Portugal",
    "comparativo",
    "autonomia WLTP",
    "custo por ponto",
    "mercado português",
  ],
}

export const viewport: Viewport = {
  themeColor: "#14201a",
  colorScheme: "light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-PT"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
