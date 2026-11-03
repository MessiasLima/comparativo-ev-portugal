/**
 * Generates the social preview images (Open Graph / Twitter) into
 * `public/og/`, at build time.
 *
 * `app/**\/opengraph-image.tsx` cannot be used here: with Cache Components the
 * route rejects `export const dynamic = "force-static"`, and with
 * `output: "export"` it requires it. Rendering the PNGs with `next/og` from a
 * script works in both build modes and keeps the images versioned with the data.
 */
import fs from "node:fs"
import path from "node:path"
import { ImageResponse } from "next/og.js"

const root = process.cwd()
const carsDir = path.join(root, "src/data/cars")
const criteriaFile = path.join(root, "src/data/criteria.ts")
const outDir = path.join(root, "public/og")
const carsOutDir = path.join(outDir, "carros")

const BG = "#14201a"
const PAPER = "#f2efe7"
const LIME = "#d7ff4f"

const nf = new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 })

function h(type, props, ...children) {
  return { type, props: { ...props, children: children.length > 1 ? children : children[0] } }
}

function text(type, style, value) {
  return h(type, { style }, value)
}

function label(value) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontSize: 24,
        letterSpacing: 6,
        textTransform: "uppercase",
        color: "rgba(242,239,231,0.7)",
      },
    },
    h("div", {
      style: { width: 18, height: 18, borderRadius: 999, background: LIME },
    }),
    value,
  )
}

const cars = fs
  .readdirSync(carsDir)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(fs.readFileSync(path.join(carsDir, file), "utf8")))

const criteriaCount = (
  fs.readFileSync(criteriaFile, "utf8").match(/\n {4}id: "/g) ?? []
).length

async function writeImage(target, element) {
  const image = new ImageResponse(element, { width: 1200, height: 630 })
  const buffer = Buffer.from(await image.arrayBuffer())
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, buffer)
  return buffer.length
}

function homeImage() {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        color: PAPER,
        padding: "64px 72px",
      },
    },
    label("Comparativo EV Portugal"),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 18 } },
      h(
        "div",
        { style: { display: "flex", gap: 18, fontSize: 86, fontWeight: 700, letterSpacing: -3 } },
        "Comparativo",
        text("span", { color: LIME }, "EV"),
      ),
      text(
        "div",
        { fontSize: 34, color: "rgba(242,239,231,0.65)" },
        `${cars.length} carros elétricos · ${criteriaCount} critérios · custo por ponto`,
      ),
    ),
    h(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 14 } },
      ...cars.slice(0, 4).map((car) =>
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 6,
              border: "1px solid rgba(242,239,231,0.18)",
              borderRadius: 16,
              padding: "16px 20px",
              background: "rgba(255,255,255,0.04)",
            },
          },
          text("div", { fontSize: 26, fontWeight: 600 }, carName(car)),
          text(
            "div",
            { fontSize: 22, color: "rgba(242,239,231,0.6)" },
            `${nf.format(car.specs.rangeKm)} km · ${car.specs.powerHp} cv`,
          ),
        ),
      ),
    ),
  )
}

function carName(car) {
  const sameModel = cars.filter(
    (item) => item.brand === car.brand && item.model === car.model,
  ).length > 1
  return sameModel
    ? `${car.brand} ${car.model} ${car.variant}`
    : `${car.brand} ${car.model}`
}

function carImage(car) {
  const name = `${car.brand} ${car.model} ${car.variant}`
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        color: PAPER,
        padding: "64px 72px",
      },
    },
    label("Comparativo EV Portugal"),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 20 } },
      text(
        "div",
        {
          fontSize: 26,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "rgba(242,239,231,0.55)",
        },
        `${car.segment} · ${car.year}`,
      ),
      text(
        "div",
        { fontSize: name.length > 32 ? 58 : 72, lineHeight: 1.05, fontWeight: 700, letterSpacing: -2 },
        name,
      ),
      h(
        "div",
        { style: { display: "flex", gap: 34, fontSize: 30 } },
        text("div", { color: LIME }, `${nf.format(car.specs.rangeKm)} km WLTP`),
        text("div", null, `${car.specs.powerHp} cv`),
        text("div", null, `${nf.format(car.price.amount)} €`),
      ),
    ),
    text(
      "div",
      { fontSize: 26, color: "rgba(242,239,231,0.55)" },
      "Autonomia, equipamento, conforto e custo por ponto.",
    ),
  )
}

let total = 0
total += await writeImage(path.join(outDir, "home.png"), homeImage())

for (const car of cars) {
  total += await writeImage(
    path.join(carsOutDir, `${car.slug}.png`),
    carImage(car),
  )
}

console.log(
  `OG images written: ${cars.length + 1} files (${Math.round(total / 1024)} KB)`,
)
