import { CRITERIA } from "@/data/criteria"

const steps = [
  {
    number: "01",
    title: "Dossier verificável",
    body: "Cada carro tem um dossiê completo com preço, motorização, bateria, carregamento, dimensões, equipamento e uma síntese editorial com fontes. Todos os valores estão à vista — nada de notas escondidas.",
  },
  {
    number: "02",
    title: "Notas comparáveis",
    body: "Conforto, som, marca, satisfação, equipamento e acabamento usam notas absolutas de 0 a 10: vêm de rubricas e contagens próprias e não dependem dos outros carros. Os critérios relativos — bagageira, autonomia, potência/peso, eficiência e carregamento — são comparados com a lista: o melhor carro da lista recebe 10 e os restantes a proporção do seu desempenho. Se entrar um novo carro, só estas cinco notas relativas se recalculam; as absolutas mantêm-se.",
  },
  {
    number: "03",
    title: "Ranking e custo-benefício",
    body: `A nota global é a média ponderada dos ${CRITERIA.length} critérios. Por defeito, acabamento e conforto contam «muito», bagageira e som «pouco» e os restantes critérios «moderadamente»; no ranking, o botão Ajustar prioridades deixa-te escolher quanto te importa cada critério, de «Não me importa» (×0) a «Extremamente importante» (×3). Esse valor é o peso do critério na média, que é normalizada pela soma dos pesos. Com a mesma nota global, fica à frente o carro mais barato. O custo-benefício compara o preço de cada carro com o preço médio da lista para a mesma nota global. Esse preço médio sai de uma recta que liga nota e preço em toda a lista. Cada modelo conta uma vez, mesmo com várias versões, e os carros muito afastados da recta pesam menos, para que um caso extremo não mude o preço médio dos restantes. Quanto mais abaixo da média, melhor o negócio.`,
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
            Prioridades ajustáveis
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
