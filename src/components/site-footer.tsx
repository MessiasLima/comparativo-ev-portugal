import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { CARS } from "@/data/cars"
import { SITE_UPDATED_AT } from "@/data/site"
import { formatCarName, formatDatePt } from "@/lib/format"
import { withBasePath } from "@/lib/base-path"

const footerCars = CARS.slice(0, 4)

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src={withBasePath("/comparativo-ev-portugal-icon.svg")}
                alt=""
                width={36}
                height={36}
                className="size-9"
              />
              <div className="flex flex-col leading-none">
                <span className="font-heading text-sm font-semibold tracking-tight">
                  Comparativo EV
                </span>
                <span className="mt-1 text-xs font-medium uppercase tracking-[0.28em] text-white/60">
                  Portugal
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
              Dossiês independentes, critérios transparentes e custo por ponto. Os
              dados são calculados a partir dos ficheiros JSON de cada carro,
              para que o ranking acompanhe qualquer alteração.
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/35">
              Atualizado a {formatDatePt(SITE_UPDATED_AT)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Explorar
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/55">
              <li>
                <Link href="/#ranking" className="transition-colors hover:text-lime">
                  Ranking geral
                </Link>
              </li>
              <li>
                <Link href="/#metodologia" className="transition-colors hover:text-lime">
                  Como calculamos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              Dossiês
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/55">
              {footerCars.map((car) => (
                <li key={car.id}>
                  <Link
                    href={`/carros/${car.slug}`}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-lime"
                  >
                    {formatCarName(car)}
                    <ArrowUpRight className="size-3.5 text-white/25 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
              {CARS.length > footerCars.length ? (
                <li>
                  <Link
                    href="/#ranking"
                    className="text-white/40 transition-colors hover:text-lime"
                  >
                    Ver todos os dossiês
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm leading-6 text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Projeto independente. Preços de referência para Portugal Continental,
            com IVA. Não substitui proposta de concessionário.
          </p>
          <p className="shrink-0">Feito em Portugal · 2026</p>
        </div>
      </div>
    </footer>
  )
}
