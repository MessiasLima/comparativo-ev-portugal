# Comparativo EV Portugal

Comparador de carros elétricos do mercado português, publicado em <https://comparativo-ev-portugal.appoutlet.dev>. O site tem duas vistas principais:

- **Home (`/`)** — hero e uma tabela única de ranking com nota global, os onze critérios e o custo em €/ponto. Em ecrãs estreitos (abaixo de 768 px) a tabela dá lugar a uma lista de cartões, com um seletor para ordenar. Qualquer coluna pode ser usada para ordenar, com atalhos para “Melhor nota” e “Melhor custo-benefício”. O botão «Ajustar prioridades» abre um modal onde, para cada critério, se escolhe com botões quanto importa (de «Não me importa» a «Extremamente importante»). A nota global, o €/ponto e o ranking só são recalculados ao clicar em Aplicar, e a configuração fica guardada no `localStorage` do browser. Cancelar fecha o modal sem alterar os pesos ativos.
- **Dossiê (`/carros/[slug]`)** — visão geral, ficha técnica, critérios de avaliação (3.1 a 3.11), equipamento, informações adicionais e fontes.

A aplicação não assume um número fixo de carros. O registo `src/data/cars/index.ts` alimenta a home, as tabelas, o rodapé e as rotas de dossiê. Cada versão do mesmo modelo é um carro autónomo: o nome público inclui sempre a marca, o modelo e a variante (por exemplo, “BYD Seal Design” e “BYD Seal Excellence AWD”).

O ícone da aplicação e o favicon são o mesmo SVG: `public/comparativo-ev-portugal-icon.svg`. É usado no cabeçalho, no rodapé, nos metadados (`icons`) e no manifest.

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/) (Base UI)
- npm

## Correr o projeto

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run validate:data
npm run build
npm start
```

## Estrutura dos dados

Cada carro vive num ficheiro JSON em `src/data/cars/`:

```text
src/data/
├── cars/
│   ├── index.ts                  # registo dos carros
│   ├── cupra-raval-vz.json
│   ├── byd-seal-design.json
│   ├── byd-seal-excellence-awd.json
│   ├── polestar-4-rear-motor-prime.json
│   ├── mazda-6e-takumi.json
│   ├── mazda-6e-takumi-plus.json
│   ├── mazda-6e-homura-plus.json
│   ├── mazda-cx-6e-takumi.json
│   ├── mazda-cx-6e-takumi-plus.json
│   ├── tesla-model-3-standard.json
│   ├── tesla-model-3-premium-long-range-rwd.json
│   ├── tesla-model-3-premium-long-range-awd.json
│   ├── tesla-model-3-performance.json
│   ├── tesla-model-y-standard.json
│   ├── tesla-model-y-premium-long-range-rwd.json
│   ├── tesla-model-y-premium-long-range-awd.json
│   ├── tesla-model-y-performance.json
│   ├── cupra-tavascan-base.json
│   ├── cupra-tavascan-drive.json
│   ├── cupra-tavascan-endurance.json
│   ├── cupra-tavascan-adrenaline.json
│   ├── cupra-tavascan-vz.json
│   ├── xpeng-l03-rwd-standard-range.json
│   ├── xpeng-l03-rwd-long-range.json
│   ├── xpeng-l03-rwd-long-range-ultra.json
│   ├── xpeng-l03-awd-performance-ultra.json
│   ├── xpeng-g6-rwd-standard-range.json
│   ├── xpeng-g6-rwd-long-range.json
│   ├── xpeng-g6-awd-performance.json
│   ├── xpeng-g6-awd-performance-black-edition.json
│   ├── leapmotor-b05-life-pro.json
│   └── leapmotor-b05-design-promax.json
├── criteria.ts                   # os 11 critérios
├── equipment.ts                  # checklist normalizada de 38 equipamentos
├── site.ts                       # data editorial da lista
└── types.ts                      # tipos do modelo de dados

src/lib/weights.ts                # pesos padrão, validação e persistência
src/lib/scoring.ts                # notas, ranking e €/ponto
src/lib/interior.ts               # rubrica do acabamento interno
src/hooks/use-weights.ts          # store de pesos reativa (localStorage)
```

O JSON guarda **dados**, não resultados. Preço, potência, bateria, autonomia, equipamento e avaliações editoriais são a matéria-prima. As notas, a nota global, o ranking e o €/ponto são sempre calculados em `src/lib/scoring.ts`.

### Adicionar um carro

1. Criar `src/data/cars/nome-do-carro.json` seguindo o formato dos existentes.
2. Importar e adicionar o carro em `src/data/cars/index.ts`.
3. Se o carro tiver equipamento novo, adicionar o item a `src/data/equipment.ts` e atualizar a checklist de todos os carros.
4. Correr `npm run validate:data` para validar IDs, fontes e equipamentos, e ver o ranking calculado no terminal.
5. Correr `npm run dev`. O ranking e as notas recalculam automaticamente.

### Como as notas são calculadas

- **Critérios objetivos com nota absoluta** — quantidade de equipamento. A contagem é feita sobre a mesma checklist de 38 itens para todos os carros e convertida para 0–10 pela proporção da checklist completa.
- **Critérios objetivos relativos** — bagageira, autonomia, potência/peso, eficiência e carregamento. A Bagageira soma os litros da traseira e do frunk; `frunkL: 0` só é usado quando a ausência é confirmada. O valor é calculado a partir dos dados do JSON e comparado com o melhor da lista.
- **Critérios editoriais** — conforto e som, ambos com nota **absoluta** de 0 a 10, sustentada por fontes no próprio JSON. A avaliação do som segue a [skill de avaliação do som](.agents/skills/evaluate-sound/SKILL.md): 50% marca do sistema de áudio, 20% número de altifalantes, 20% opiniões específicas e 10% potência RMS. Uma potência publicada em watts é tratada como RMS, salvo se a fonte indicar outra base de medição; sem qualquer valor de potência, usa-se a referência neutra.
- **Marca e assistência** — rubrica **absoluta** com seis componentes sobre idade global e presença em Portugal, rede autorizada, fabrico europeu, apoio e estabilidade financeira. A [skill de avaliação da marca](.agents/skills/evaluate-brand/SKILL.md) orienta a evidência; o cálculo e os pesos vivem em `src/lib/brand.ts`.
- **Satisfação, defeitos e recalls** — rubrica **absoluta** baseada em relatos de proprietários, testes de longa duração e campanhas/recalls específicos.
- **Acabamento interno** — critério de rubrica, com nota **absoluta** (não relativa à lista). A avaliação dos componentes, do estilo e do plástico duro segue a [skill de avaliação do interior](.agents/skills/evaluate-interior/SKILL.md); a fórmula vive em `src/lib/interior.ts` e os dados de cada carro em `reviews.interior.assessment`.
- **Relatividade** — só os cinco critérios de dados (bagageira, autonomia, potência/peso, eficiência e carregamento) são relativos à lista: o melhor carro recebe 10 e os restantes a proporção do seu desempenho face ao líder. Se entrar um carro novo, só estas notas mudam; conforto, som, marca, satisfação, equipamento e acabamento mantêm-se, porque são absolutas.
- **Nota global** — média ponderada dos 11 critérios. Cada critério tem um peso-multiplicador escolhido entre cinco níveis (`WEIGHT_LEVELS` em `src/lib/weights.ts`): «Não me importa» ×0, «Importa-me pouco» ×0,5, «Importa-me moderadamente» ×1, «Importa-me muito» ×2 e «Extremamente importante» ×3. Por defeito, acabamento e conforto estão em ×2, bagageira e som em ×0,5 e os restantes critérios em ×1 (`DEFAULT_WEIGHTS`). No modal, ×0 é cinzento e os restantes níveis são o verde da marca cada vez mais intenso, sem cores de alerta. A média é normalizada pela soma dos multiplicadores, pelo que com todos iguais resulta na média simples. Um valor guardado que não seja um destes níveis volta ao valor por defeito desse critério. Com a mesma nota global, fica à frente no ranking o carro mais barato (`src/lib/ranking.ts`).
- **Custo-benefício** — `preço / nota global` = euros por ponto. Quanto menor, melhor.
- **Persistência** — os pesos são guardados em `localStorage` com a chave `comparativo-ev-portugal:weights:v3` e recuperados quando o utilizador volta ao site. A tabela e o painel de nota dos dossiês usam a mesma configuração.

O carregamento usa apenas a **potência DC de pico** (`charging.dcKw`), relativa ao melhor da lista: é o que determina o tempo de paragem numa viagem. A potência AC continua no JSON como dado do carro mas não pontua — hoje todos os carros comparados aceitam 11 kW, por isso não os distingue. A quantidade de equipamento é contada sobre a mesma checklist de 38 itens para todos os carros e convertida numa nota absoluta de 0 a 10 pela proporção da checklist preenchida.

## Dados e preços

- Preços de referência para **Portugal Continental**, com IVA, à data indicada em cada JSON.
- CUPRA Raval VZ: proposta `C84TSZ1`, com opcionais, fornecida pelo utilizador. O PDF original está em `public/sources/`.
- BYD Seal Excellence AWD: PVP de referência da Caetano (concessionário oficial BYD). O guia do produto está em `public/sources/`.
- Polestar 4 coupé RM Prime: configuração fornecida pelo utilizador, encomendada em 03/11/2026 com entrega prevista para março–abril de 2027. O total de 56.800 € inclui IVA, legalização, transporte e a oferta indicada no PDF; a versão e o equipamento foram cruzados com a ficha MY27 da Polestar.
- Mazda 6e Takumi, Takumi Plus e Homura Plus: configurações de 14/11/2026 fornecidas pelo utilizador, com PVP de 43.608,00 € (Takumi) e 45.558,00 € (Takumi Plus e Homura Plus) com IVA, sem despesas de legalização e transporte nem pintura metalizada. Os PDF originais estão em `public/sources/`; as especificações foram cruzadas com a Mazda Portugal, a EV Database e a imprensa especializada. A campanha de financiamento baixa os preços para 39.928,00 € e 41.878,00 €.
- Mazda CX-6e Takumi e Takumi Plus: configurações de 13/11/2026 fornecidas pelo utilizador, com PVPR de 44.987,55 € e 47.987,55 € com IVA, sem despesas de legalização e transporte nem pintura metalizada. Os PDF originais estão em `public/sources/`; as especificações foram cruzadas com a Mazda Portugal, a EV Database, a ficha técnica alemã e a imprensa. A campanha até 31/12/2026 baixa os preços para 41.543,55 € e 44.543,55 €.
- Tesla Model 3 Standard, Premium Long Range RWD, Premium Long Range AWD e Performance: propostas de 13/11/2026 fornecidas pelo utilizador, com preço de aquisição que inclui IVA, despesas de documentação e transporte e taxa para pneus. Os PDF originais estão em `public/sources/`; as especificações foram cruzadas com a Tesla Portugal, a EV Database e a Model3.info.
- Tesla Model Y Standard, Premium Long Range RWD, Premium Long Range AWD e Performance: propostas de 16/11/2026 fornecidas pelo utilizador, com preço de aquisição que inclui IVA, despesas de documentação e transporte e taxa para pneus. Os PDF originais estão em `public/sources/`; as especificações foram cruzadas com a Tesla Portugal, a EV Database, o autoteste do ADAC e a imprensa especializada.
- XPENG L03 RWD Standard Range, RWD Long Range, RWD Long Range Ultra e AWD Performance Ultra: PVP do configurador oficial da XPENG Portugal de 16/11/2026, sem a campanha de financiamento (que reduz cada preço em 1.491,99 €) e sem despesas administrativas e de transporte. A Performance Ultra só tem a pintura Midnight Black (+900 €), incluída no preço. O configurador português não publica potência, consumo nem autonomia da versão de tração integral, nem o peso de nenhuma versão: estes valores vêm da XPENG Alemanha, do EV Database, do ADAC e do CarNewsChina (pesos sem condutor), e o equipamento da Long Range Ultra é inferido da versão de tração integral, que partilha a mesma lista no configurador.
- XPENG G6 RWD Standard Range, RWD Long Range, AWD Performance e AWD Performance Black Edition: PVP do configurador oficial da XPENG Portugal de 16/11/2026, sem a campanha de financiamento (que reduz o preço em 1.701,81 €, 1.949,98 €, 749,99 € e 749,99 €, respetivamente) e sem despesas administrativas e de transporte. A Black Edition só tem a pintura Midnight Black, incluída no preço, e tem o mesmo equipamento da AWD Performance segundo a API do configurador. Autonomia e consumo vêm do configurador português, que diverge do EV Database e do ADAC na Standard Range (480 vs 470/455 km) e na Long Range (535 vs 525 km; 17,9 vs 17,5 kWh/100 km); o consumo da AWD (18,4 kWh/100 km), não publicado em Portugal, vem do EV Database e do ADAC. Os pesos são os da página portuguesa, sem condutor.
- Leapmotor B05 Life Pro e Design ProMax: PVP do comunicado de lançamento da Leapmotor em Portugal (Stellantis, 06/10/2026), de 26.285 € e 30.285 € com IVA, sem a campanha para particulares e sem despesas de legalização e transporte. A brochura europeia fornecida está em `public/sources/`; as especificações foram cruzadas com o site e a brochura portuguesa, o EV Database e o Guia do Automóvel. O consumo usado (15,8 e 15,9 kWh/100 km) é o da brochura e do EV Database, não o do site português (14 e 14,8 kWh/100 km), e a potência DC (156 e 174 kW) é a do site português, não a da brochura portuguesa (140 e 168 kW). A Life ProMax não entra porque a Leapmotor não publica o seu preço em Portugal.
- Autonomia e consumo são **WLTP**. Os valores reais variam com percurso, clima, carga e estilo de condução.
- As avaliações editoriais são uma síntese de imprensa especializada, dados oficiais e testemunhos de proprietários. As fontes estão listadas em cada dossiê.
- As descrições evitam comparações relativas à lista (“o mais caro”, “a maior autonomia”), porque ficariam desatualizadas assim que entrasse um carro novo. Os rankings, contagens e superlativos são calculados na interface; o texto usa valores concretos ou comparações com carros nomeados.

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Hero + tabela de ranking ordenável + metodologia |
| `/carros/[slug]` | Dossiê gerado para cada carro registado |
| `/sitemap.xml` | Sitemap com home, dossiês e imagens sociais |
| `/robots.txt` | Regras de indexação + referência ao sitemap |

Rotas atuais: `/carros/cupra-raval-vz`, `/carros/cupra-tavascan-base`, `/carros/cupra-tavascan-drive`, `/carros/cupra-tavascan-endurance`, `/carros/cupra-tavascan-adrenaline`, `/carros/cupra-tavascan-vz`, `/carros/byd-seal-design`, `/carros/byd-seal-excellence-awd`, `/carros/polestar-4-rear-motor-prime`, `/carros/mazda-6e-takumi`, `/carros/mazda-6e-takumi-plus`, `/carros/mazda-6e-homura-plus`, `/carros/mazda-cx-6e-takumi`, `/carros/mazda-cx-6e-takumi-plus`, `/carros/tesla-model-3-standard`, `/carros/tesla-model-3-premium-long-range-rwd`, `/carros/tesla-model-3-premium-long-range-awd`, `/carros/tesla-model-3-performance`, `/carros/tesla-model-y-standard`, `/carros/tesla-model-y-premium-long-range-rwd`, `/carros/tesla-model-y-premium-long-range-awd`, `/carros/tesla-model-y-performance`, `/carros/xpeng-l03-rwd-standard-range`, `/carros/xpeng-l03-rwd-long-range`, `/carros/xpeng-l03-rwd-long-range-ultra` `/carros/xpeng-l03-awd-performance-ultra`, `/carros/xpeng-g6-rwd-standard-range`, `/carros/xpeng-g6-rwd-long-range`, `/carros/xpeng-g6-awd-performance`, `/carros/xpeng-g6-awd-performance-black-edition`, `/carros/leapmotor-b05-life-pro` e `/carros/leapmotor-b05-design-promax`.

## SEO

- **Site publicado** — <https://comparativo-ev-portugal.appoutlet.dev> (GitHub Pages com domínio próprio). O site é servido na raiz do domínio.
- **Canonical e domínio** — `src/lib/site-url.ts` define a origem pública, com `https://comparativo-ev-portugal.appoutlet.dev` como fallback. O deploy passa `NEXT_PUBLIC_SITE_URL` explicitamente; qualquer build pode forçar outra origem com `NEXT_PUBLIC_SITE_URL=https://exemplo.pt npm run build`. Canonicals, Open Graph, sitemap e robots usam sempre essa origem.
- **`basePath`** — vazio no domínio próprio: os assets são servidos em `/_next/...` na raiz. `NEXT_PUBLIC_BASE_PATH` só é necessário se o site voltar a ser publicado num subcaminho, como `/comparativo-ev-portugal`.
- **Sitemap e robots** — gerados por `npm run seo` (executado antes de `dev` e `build`) em `public/sitemap.xml` e `public/robots.txt`. Não usam as rotas `app/sitemap.ts`/`app/robots.ts` porque estas exigem `force-static` em exportação estática, diretiva que o modo com Cache Components rejeita. Os ficheiros gerados estão no `.gitignore`.
- **Redes sociais** — cada página tem `openGraph` e `twitter:summary_large_image`. As imagens PNG 1200×630 são geradas a partir dos JSONs por `scripts/generate-og.mjs` em `public/og/` (home + um por carro) e não são versionadas.
- **Dados estruturados** — `WebSite` + `ItemList` na home e `BreadcrumbList` + `Product`/`Car` (com `Offer`, especificações e avaliação editorial) nos dossiês. O componente `JsonLd` escapa `<` para evitar fechar o `script`.
- **Verificação** — Lighthouse (build de produção, mobile): SEO 100, Boas práticas 100, Acessibilidade 100; desempenho 95–96 (LCP ~2,9 s, TBT 10 ms, CLS 0). O modal de pesos é carregado só ao abrir (`next/dynamic`), mantendo o JS inicial abaixo dos 175 KB.

## Analytics

O site usa **Umami** (analytics sem cookies) através de um `<script defer>` no `<head>` do layout raiz, identificado pelo website ID `8a02495b-916b-4a40-a014-08eb3a060c3e`. Carrega em todas as páginas, não bloqueia o render e acrescenta cerca de 3 KB ao total transferido; não afeta as métricas de Lighthouse (desempenho mantém-se em 96).

Além das visitas, o site envia eventos personalizados. Os elementos clicáveis levam `data-track="<evento>"` e `data-track-<chave>="<valor>"` (gerados por `trackAttributes` em `src/lib/analytics.ts`, também em Server Components) e o `AnalyticsListener` montado no layout envia-os com `umami.track`. As ações que dependem de estado chamam `trackEvent` diretamente. Não se usa `data-umami-event`, porque em links internos o script do Umami cancela o clique e força um reload completo, o que estraga a navegação do Next.

| Evento | Quando | Dados |
| --- | --- | --- |
| `ranking-ordenar` | Mudar a ordenação do ranking | `criterio`, `direcao`, `origem` (`cabecalho`, `atalho`, `seletor`, `inverter`) |
| `prioridades-abrir` | Abrir o modal de prioridades | `personalizadas` |
| `prioridades-aplicar` | Aplicar prioridades | `alteracoes`, `porDefeito` e o peso de cada critério |
| `prioridades-cancelar` | Fechar o modal sem aplicar | `via` (`cancelar`, `fechar`, `escape`, `fora`), `alteracoes` |
| `prioridades-repor` | «Repor defeito» no modal | — |
| `abrir-dossie` | Abrir o dossiê de um carro | `carro`, `origem` (`ranking-tabela`, `ranking-cartao`, `rodape`), `posicao` e `ordem` no ranking |
| `preco-ideal-ver` | Primeiro tooltip do preço ideal de cada ícone | `carro`, `origem`, `melhorValor`, `personalizadas` |
| `criterio-explicacao-ver` | Tooltip de um critério no cabeçalho da tabela | `criterio` |
| `navegar` | Links internos (cabeçalho, hero, rodapé, voltar, 404) | `destino`, `origem`, `carro` quando vem de um dossiê |
| `dossie-secao` | Atalhos para secções do dossiê | `carro`, `secao`, `origem` |
| `dossie-criterio` | Abrir ou fechar um critério no dossiê | `carro`, `criterio` |
| `abrir-fonte` | Abrir uma fonte externa | `carro`, `fonte`, `tipo`, `origem`, `criterio` quando vem de um critério |
| `link-externo` | Link para a AppOutlet no rodapé | `destino` |

## Notas de implementação

- O cálculo é feito em Server Components, a partir dos JSONs, sem notas hardcoded nas páginas.
- O ranking aceita qualquer número de carros; a tabela, o rodapé e os dossiês são gerados a partir do registo.
- A tabela é um Client Component porque guarda o estado de ordenação e os pesos; os critérios são calculados no servidor e a nota global é recalculada no browser com os pesos ativos.
- O store de pesos usa `useSyncExternalStore` para manter a tabela e o painel de nota dos dossiês sincronizados com o `localStorage`.
- A definição de cada critério (label, shortLabel, pergunta, descrição e ícone Lucide) vive em `src/data/criteria.ts`. A tabela usa essa mesma definição no tooltip que aparece após 1 segundo de hover.
- O rodapé mostra até quatro dossiês e acrescenta “Ver todos” quando a lista cresce.
- `generateStaticParams` pré-renderiza os dossiês existentes; em desenvolvimento, alterações aos JSONs refletem-se no próximo pedido.
- O projeto não usa imagens de imprensa. O visual é construído com tipografia, cor e dados para evitar dependências de licenciamento.
