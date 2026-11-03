/**
 * Pre-build SEO files: sitemap.xml and robots.txt.
 *
 * These are written into `public/` instead of using the `app/sitemap.ts` and
 * `app/robots.ts` metadata routes on purpose. This project builds in two modes:
 *
 * - `next build` with Cache Components (the metadata routes reject
 *   `export const dynamic = "force-static"`).
 * - `next build` with `output: "export"` for GitHub Pages (the metadata routes
 *   require that same directive, otherwise the build fails while collecting
 *   page data).
 *
 * Writing plain files works in both modes and in `next dev`. URLs are absolute
 * and built from NEXT_PUBLIC_SITE_URL (set by the deploy workflow, with the
 * production custom domain as fallback), so the sitemap points at the public
 * origin.
 */
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const carsDir = path.join(root, "src/data/cars")
const publicDir = path.join(root, "public")
const siteFile = path.join(root, "src/data/site.ts")

const FALLBACK_SITE_URL = "https://comparativo-ev-portugal.appoutlet.dev"

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "")
}

const siteUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL,
)

function absoluteUrl(sitePath = "/") {
  const normalized = sitePath.startsWith("/") ? sitePath : `/${sitePath}`
  return `${siteUrl}${normalized}`
}

function readUpdatedAt() {
  const source = fs.readFileSync(siteFile, "utf8")
  const match = source.match(/SITE_UPDATED_AT\s*=\s*"([^"]+)"/)
  if (!match) {
    throw new Error("SITE_UPDATED_AT not found in src/data/site.ts")
  }
  return match[1]
}

const cars = fs
  .readdirSync(carsDir)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(fs.readFileSync(path.join(carsDir, file), "utf8")))

const updatedAt = readUpdatedAt()
const lastmod = `${updatedAt}T00:00:00.000Z`

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

const entries = [
  {
    loc: absoluteUrl("/"),
    priority: "1.0",
    changefreq: "weekly",
    image: absoluteUrl("/og/home.png"),
  },
  ...cars.map((car) => ({
    loc: absoluteUrl(`/carros/${car.slug}/`),
    priority: "0.8",
    changefreq: "monthly",
    image: absoluteUrl(`/og/carros/${car.slug}.png`),
  })),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <image:image>
      <image:loc>${escapeXml(entry.image)}</image:loc>
    </image:image>
  </url>`,
  )
  .join("\n")}
</urlset>
`

const robots = `# https://www.robotstxt.org/robotstxt.html
User-Agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`

fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap)
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots)

console.log(
  `SEO files written for ${siteUrl}: sitemap.xml (${entries.length} URLs), robots.txt`,
)
