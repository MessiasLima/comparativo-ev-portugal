import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="relative mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-lime">
          Erro 404
        </p>
        <h1 className="mt-4 font-heading text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
          Fora de rota.
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-white/60">
          O carro que procura não está neste comparativo. Volte ao ranking para
          ver os dossiês disponíveis.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-lime px-5 text-sm font-medium text-ink transition-colors hover:bg-lime/85"
        >
          <ArrowLeft className="size-4" />
          Voltar ao comparativo
        </Link>
      </div>
    </section>
  )
}
