import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { withBasePath } from "@/lib/base-path"
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  publicAssetUrl,
} from "@/lib/site-url"

const UMAMI_SCRIPT_URL = "https://umami.appoutlet.dev/script.js"
const UMAMI_WEBSITE_ID = "8a02495b-916b-4a40-a014-08eb3a060c3e"

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: publicAssetUrl("/og/home.png"),
        width: 1200,
        height: 630,
        alt: "Comparativo EV Portugal — ranking de carros elétricos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [publicAssetUrl("/og/home.png")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "automotive",
  icons: {
    icon: [
      {
        url: withBasePath("/comparativo-ev-portugal-icon.svg"),
        type: "image/svg+xml",
      },
    ],
    shortcut: withBasePath("/comparativo-ev-portugal-icon.svg"),
    apple: withBasePath("/comparativo-ev-portugal-icon.svg"),
  },
  manifest: withBasePath("/manifest.webmanifest"),
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
      <head>
        <script
          defer
          src={UMAMI_SCRIPT_URL}
          data-website-id={UMAMI_WEBSITE_ID}
        />
      </head>
      <body className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
