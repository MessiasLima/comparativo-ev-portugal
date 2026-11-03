import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BatteryCharging,
  Check,
  ExternalLink,
  Gauge,
  Route,
  Scale,
  Timer,
  X,
  Zap,
} from "lucide-react"
import { CriterionList } from "@/components/criterion-list"
import { EquipmentChecklist } from "@/components/equipment-checklist"
import { SpecGrid } from "@/components/spec-grid"
import { JsonLd } from "@/components/structured-data"
import { WeightedScorePanel } from "@/components/weighted-score-panel"
import { Badge } from "@/components/ui/badge"
import { CRITERIA } from "@/data/criteria"
import { EQUIPMENT_CHECKLIST } from "@/data/equipment"
import type { CriterionId, Source } from "@/data/types"
import {
  formatCarName,
  formatDatePt,
  formatEuro,
  formatNumber,
  formatScore,
  truncateText,
} from "@/lib/format"
import { getComparison, getScoredCar } from "@/lib/scoring"
import {
  SITE_LOCALE,
  SITE_NAME,
  absoluteUrl,
  publicAssetUrl,
} from "@/lib/site-url"
import { cn } from "cn"

const navItems = [
  { href: "#visao-geral", label: "Visão geral" },
  { href: "#ficha-tecnica", label: "Ficha técnica" },
  { href: "#criterios", label: "Critérios de avaliação" },
  { href: "#equipamento", label: "Equipamento" },
  { href: "#informacoes", label: "Informações adicionais" },
  { href: "#fontes", label: "Fontes" },
]

const sourceTypeLabel: Record<Source["type"], string> = {
  official: "Oficial",
  press: "Imprensa",
  owner: "Proprietários",
  database: "Base de dados",
  pdf: "PDF",
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-6 border-b border-line pb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
        <span className="font-mono">{index}</span>
        <span className="mx-2 text-copper/50">·</span>
        {eyebrow}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function generateStaticParams() {
  return getComparison().cars.map((entry) => ({ slug: entry.car.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/carros/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const entry = getScoredCar(slug)
  if (!entry) return { title: "Carro não encontrado" }

  const { car } = entry
  const title = formatCarName(car)
  const description = truncateText(`${car.tagline} ${car.dossier.verdict}`)
  const canonical = absoluteUrl(`/carros/${car.slug}/`)
  const image = {
    url: publicAssetUrl(`/og/carros/${car.slug}.png`),
    width: 1200,
    height: 630,
    alt: `${title} — autonomia, equipamento e custo por ponto`,
  }

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  }
}

export default async function CarPage({ params }: PageProps<"/carros/[slug]">) {
  const { slug } = await params
  const entry = getScoredCar(slug)
  if (!entry) notFound()

  const { car } = entry
  const comparison = getComparison()
  const leadingCriteria = CRITERIA.filter(
    (criterion) => entry.criteria[criterion.id].rank === 1,
  ).length
  const scoreCars = comparison.cars.map((item) => ({
    id: item.car.id,
    price: item.car.price.amount,
    scores: Object.fromEntries(
      CRITERIA.map((criterion) => [
        criterion.id,
        item.criteria[criterion.id].score,
      ]),
    ) as Record<CriterionId, number>,
  }))

  const canonical = absoluteUrl(`/carros/${car.slug}/`)
  const ogImage = publicAssetUrl(`/og/carros/${car.slug}.png`)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Ranking",
            item: absoluteUrl("/#ranking"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: formatCarName(car),
            item: canonical,
          },
        ],
      },
      {
        "@type": ["Product", "Car"],
        "@id": `${canonical}#product`,
        name: formatCarName(car),
        description: car.dossier.verdict,
        url: canonical,
        image: ogImage,
        category: car.segment,
        brand: { "@type": "Brand", name: car.brand },
        model: car.model,
        vehicleModelDate: String(car.year),
        bodyType: car.segment,
        fuelType: "Electric",
        vehicleTransmission: car.specs.drivetrain,
        seatingCapacity: car.specs.seats,
        numberOfDoors: car.specs.doors,
        weight: {
          "@type": "QuantitativeValue",
          value: car.specs.weightKg,
          unitCode: "KGM",
        },
        offers: {
          "@type": "Offer",
          price: car.price.amount,
          priceCurrency: car.price.currency,
          availability: "https://schema.org/InStock",
          url: canonical,
          seller: { "@type": "Organization", name: SITE_NAME },
        },
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Autonomia WLTP",
            value: car.specs.rangeKm,
            unitCode: "KMT",
          },
          {
            "@type": "PropertyValue",
            name: "Consumo WLTP",
            value: car.specs.consumptionKwh100,
            unitText: "kWh/100 km",
          },
          {
            "@type": "PropertyValue",
            name: "Bateria utilizável",
            value: car.specs.usableBatteryKwh,
            unitCode: "KWH",
          },
          {
            "@type": "PropertyValue",
            name: "Potência",
            value: car.specs.powerKw,
            unitCode: "KWT",
          },
        ],
        review: {
          "@type": "Review",
          name: `Avaliação editorial: ${formatCarName(car)}`,
          reviewBody: car.dossier.verdict,
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
          reviewRating: {
            "@type": "Rating",
            ratingValue: Number(entry.total.toFixed(2)),
            bestRating: 10,
            worstRating: 0,
          },
        },
      },
    ],
  }

  return (
    <article>
      <JsonLd data={structuredData} />
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/65 transition-colors hover:text-lime"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao comparativo
          </Link>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    car.accent === "copper" ? "bg-copper" : "bg-ocean",
                  )}
                />
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/65">
                  {car.brand} · {car.year} · {car.segment}
                </p>
                <Badge
                  variant="outline"
                  className="border-white/15 text-xs text-white/70"
                >
                  Dossiê
                </Badge>
              </div>

              <h1
                aria-label={formatCarName(car)}
                className="mt-4 font-heading text-5xl leading-[0.95] font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl"
              >
                {car.brand}
                <br />
                {car.model}
                <span className="mt-2 block text-2xl leading-tight tracking-[-0.03em] text-lime sm:text-3xl lg:text-4xl">
                  {car.variant}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
                {car.tagline}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-lime/25 bg-lime/10 px-3 py-1.5 font-mono text-sm font-medium text-lime">
                  {formatEuro(car.price.amount)}
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70">
                  Garantia: {car.warranty.vehicle}
                </span>
              </div>
            </div>

            <WeightedScorePanel
              cars={scoreCars}
              carId={car.id}
              equipmentCount={entry.equipmentCount}
              leadingCriteria={leadingCriteria}
            />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                label: "Autonomia",
                value: `${formatNumber(car.specs.rangeKm)} km`,
                icon: Route,
              },
              {
                label: "0-100 km/h",
                value: `${formatScore(car.specs.acceleration0100)} s`,
                icon: Timer,
              },
              {
                label: "Potência",
                value: `${formatNumber(car.specs.powerHp)} cv`,
                icon: Gauge,
              },
              {
                label: "Consumo",
                value: `${formatScore(car.specs.consumptionKwh100)} kWh/100`,
                icon: Zap,
              },
              {
                label: "DC",
                value: `${formatNumber(car.charging.dcKw)} kW`,
                icon: BatteryCharging,
              },
              {
                label: "Peso",
                value: `${formatNumber(car.specs.weightKg)} kg`,
                icon: Scale,
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink/85 px-4 py-3.5">
                <div className="flex items-center gap-2 text-white/35">
                  <stat.icon className="size-3" />
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-1.5 font-mono text-sm font-medium text-white/80">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 py-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-14 lg:py-14">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Neste dossiê
              </p>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 space-y-14 sm:space-y-20">
            <nav className="sticky top-16 z-30 -mx-5 flex gap-2 overflow-x-auto border-y border-line bg-background/95 px-5 py-3 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:hidden">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <section id="visao-geral" className="scroll-mt-28">
              <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
                    <span className="font-mono">01</span>
                    <span className="mx-2 text-copper/50">·</span>
                    Visão geral
                  </p>
                  <h2 className="mt-2 max-w-2xl font-heading text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl">
                    {car.dossier.headline}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                    {car.dossier.verdict}
                  </p>
                  <div className="mt-6 rounded-2xl border border-line bg-sand/55 p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Ideal para
                    </p>
                    <p className="mt-2 text-base leading-7">{car.dossier.bestFor}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-line bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
                      Pontos fortes
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {car.dossier.pros.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-sm leading-6 text-muted-foreground"
                        >
                          <Check className="mt-0.5 size-3.5 shrink-0 text-forest" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-line bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                      A rever
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {car.dossier.cons.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-sm leading-6 text-muted-foreground"
                        >
                          <X className="mt-0.5 size-3.5 shrink-0 text-copper" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="ficha-tecnica" className="scroll-mt-28">
              <SectionHeading
                index="02"
                eyebrow="Ficha técnica"
                title="Ficha técnica completa."
                description="Especificações do dossier. Autonomia e consumo são valores WLTP; os reais variam com o uso."
              />
              <SpecGrid entry={entry} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-card p-4 text-base leading-7 text-muted-foreground">
                  <span className="font-medium text-foreground">Nota de preço:</span>{" "}
                  {car.price.note}
                </div>
                <div className="rounded-xl border border-line bg-card p-4 text-base leading-7 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Nota de garantia:
                  </span>{" "}
                  {car.warranty.note}
                </div>
              </div>
            </section>

            <section id="criterios" className="scroll-mt-28">
              <SectionHeading
                index="03"
                eyebrow="Critérios de avaliação"
                title="Nota a nota, com a fonte à vista."
                description="Cada critério tem uma nota de 0 a 10 e indica se é relativa à lista ou absoluta. Nos critérios relativos, o melhor carro comparado recebe 10 e os restantes a proporção do seu desempenho; o acabamento interno usa uma rubrica absoluta de materiais. Abra 3.1 Acabamento interno para ver a decomposição, a síntese e as fontes."
              />
              <CriterionList
                entry={entry}
                totalCars={comparison.cars.length}
                sectionNumber={3}
              />
            </section>

            <section id="equipamento" className="scroll-mt-28">
              <SectionHeading
                index="04"
                eyebrow="Equipamento"
                title="O que traz, o que falta."
                description={`A mesma checklist de ${EQUIPMENT_CHECKLIST.length} itens é aplicada a todos os carros. Isto permite comparar quantidades sem cair na armadilha de somar nomes diferentes para a mesma tecnologia.`}
              />
              <EquipmentChecklist entry={entry} />
            </section>

            <section id="informacoes" className="scroll-mt-28">
              <SectionHeading
                index="05"
                eyebrow="Informações adicionais"
                title="Tudo o que importa, sem pressa."
                description="Contexto, comportamento, vida a bordo e propriedade. A parte editorial que os números não contam."
              />
              <div className="grid gap-4 md:grid-cols-2">
                {car.dossier.sections.map((section, index) => (
                  <article
                    key={section.title}
                    className={cn(
                      "rounded-2xl border border-line bg-card p-5 sm:p-6",
                    )}
                  >
                    <p className="font-mono text-xs text-copper">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-heading text-lg font-semibold">
                      {section.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {section.body}
                    </p>
                    {section.bullets?.length ? (
                      <ul className="mt-4 space-y-2">
                        {section.bullets.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2 text-sm leading-6 text-muted-foreground"
                          >
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-copper" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <section id="fontes" className="scroll-mt-28">
              <SectionHeading
                index="06"
                eyebrow="Fontes"
                title="De onde vêm os dados."
                description={`Documentos oficiais, fichas técnicas, imprensa especializada e testemunhos de proprietários. Acesso em ${formatDatePt(comparison.updatedAt)}.`}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {car.sources.map((source) => {
                  const content = (
                    <>
                      <span className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-line text-xs text-muted-foreground"
                        >
                          {sourceTypeLabel[source.type]}
                        </Badge>
                        {source.url ? (
                          <ExternalLink className="size-3 text-muted-foreground/50" />
                        ) : null}
                      </span>
                      <span className="mt-2 block text-sm leading-6 font-medium">
                        {source.label}
                      </span>
                    </>
                  )

                  return source.url ? (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-line bg-card p-4 transition-colors hover:border-foreground/25 hover:bg-muted/30"
                    >
                      {content}
                    </a>
                  ) : (
                    <div
                      key={source.id}
                      className="rounded-xl border border-line bg-card p-4"
                    >
                      {content}
                    </div>
                  )
                })}
              </div>
            </section>

            <div className="border-t border-line pt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Voltar ao ranking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
