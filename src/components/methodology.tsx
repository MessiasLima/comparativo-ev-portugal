import { CRITERIA } from "@/data/criteria"

const steps = [
  {
    number: "01",
    title: "Dossier verificável",
    body: "Cada carro tem um ficheiro JSON com preço, powertrain, bateria, carregamento, dimensões, equipamento e uma síntese editorial com fontes. Nada de notas escondidas no código.",
  },
  {
    number: "02",
    title: "Notas comparáveis",
    body: "Nos critérios de dados e nas avaliações editoriais, o melhor carro da lista recebe 10 e os restantes a proporção do seu desempenho. O acabamento interno é a exceção: usa uma rubrica absoluta — superfícies macias, estofos e couro, design contido, montagem e proporção de plástico duro —, para que uma cabine maioritariamente plástica não chegue ao topo só por ser a menos má. Se entrar um novo carro, as notas relativas recalculam-se automaticamente.",
  },
  {
    number: "03",
    title: "Ranking e custo por ponto",
    body: `A nota global é a média ponderada dos ${CRITERIA.length} critérios. Por defeito, todos pesam o mesmo; no ranking, podes ajustar os pesos no botão Pesos — cada peso é um multiplicador ×0 a ×2 da nota desse critério, e a média é normalizada pela soma dos multiplicadores. O custo-benefício divide o preço pela nota global: quanto menos euros por ponto, melhor o negócio.`,
  },
]

export function Methodology() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <div className="space-y-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-line bg-card p-5 sm:p-6"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-copper">{step.number}</span>
                <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
              </div>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-sand/70 p-5 text-base leading-7 text-muted-foreground sm:p-6">
          <p className="font-semibold uppercase tracking-[0.18em] text-foreground">
            Nota importante
          </p>
          <p className="mt-3">
            Preços de referência para Portugal Continental, com IVA, à data
            indicada em cada dossiê. O preço usado é o da configuração avaliada,
            incluindo os opcionais assinalados. Autonomia e consumo são WLTP. Os
            valores reais variam com o percurso, o clima, a carga e o estilo de
            condução. Isto não substitui um test drive.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Os {CRITERIA.length} critérios
            </p>
            <h3 className="mt-2 font-heading text-xl font-semibold">
              O que entra na nota
            </h3>
          </div>
          <span className="rounded-full bg-forest px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-lime">
            Pesos ajustáveis
          </span>
        </div>

        <div className="mt-2 divide-y divide-line">
          {CRITERIA.map((criterion) => {
            const Icon = criterion.icon
            return (
            <div
              key={criterion.id}
              className="grid grid-cols-[2rem_1fr] gap-3 py-4 sm:grid-cols-[2.5rem_1fr_auto]"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-forest">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">{criterion.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {criterion.description}
                </p>
              </div>
              <span className="hidden self-start rounded-full border border-line px-2 py-0.5 font-mono text-xs text-muted-foreground sm:block">
                {criterion.kind === "objective"
                  ? "dados"
                  : criterion.kind === "rubric"
                    ? "rubrica"
                    : "editorial"}
              </span>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
