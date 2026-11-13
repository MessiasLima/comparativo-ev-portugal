# Comparativo EV Portugal

Comparador de carros elétricos do mercado português, publicado em <https://comparativo-ev-portugal.appoutlet.dev>. O site tem duas vistas principais:

- **Home (`/`)** — hero e uma tabela única de ranking com nota global, os onze critérios e o custo em €/ponto. Qualquer coluna pode ser usada para ordenar, com atalhos para “Melhor nota” e “Melhor custo-benefício”. O botão Pesos abre um modal para ajustar o peso de cada critério; ao mover os sliders, a nota global, o €/ponto e o ranking são recalculados em tempo real (com pré-visualização dentro do modal) e a configuração fica guardada no `localStorage` do browser. Cancelar repõe os pesos que estavam ativos ao abrir o modal.
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
│   └── polestar-4-rear-motor-prime.json
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

- **Critérios objetivos** — bagageira, autonomia, potência/peso, eficiência, carregamento e quantidade de equipamento. A Bagageira soma os litros da traseira e do frunk; `frunkL: 0` só é usado quando a ausência é confirmada. O valor é calculado a partir dos dados do JSON.
- **Critérios editoriais** — conforto e som. Cada carro tem uma avaliação base de 0 a 10, sustentada por fontes no próprio JSON. A avaliação do som segue a [skill de avaliação do som](.agents/skills/evaluate-sound/SKILL.md): 50% marca do sistema de áudio, 20% número de altifalantes, 20% opiniões específicas e 10% potência RMS. Uma potência publicada em watts é tratada como RMS, salvo se a fonte indicar outra base de medição; sem qualquer valor de potência, usa-se a referência neutra.
- **Marca e assistência** — rubrica relativa com seis componentes sobre idade global e presença em Portugal, rede autorizada, fabrico europeu, apoio e estabilidade financeira. A [skill de avaliação da marca](.agents/skills/evaluate-brand/SKILL.md) orienta a evidência; o cálculo e os pesos vivem em `src/lib/brand.ts`.
- **Satisfação, defeitos e recalls** — rubrica relativa baseada em relatos de proprietários, testes de longa duração e campanhas/recalls específicos.
- **Acabamento interno** — critério de rubrica, com nota **absoluta** (não relativa à lista). A avaliação dos componentes, do estilo e do plástico duro segue a [skill de avaliação do interior](.agents/skills/evaluate-interior/SKILL.md); a fórmula vive em `src/lib/interior.ts` e os dados de cada carro em `reviews.interior.assessment`.
- **Relatividade** — nos restantes critérios, o melhor carro da lista recebe 10. Os restantes recebem a proporção do seu desempenho face ao líder. Se entrar um carro novo, estas notas mudam; a rubrica de acabamento não muda, porque é absoluta.
- **Nota global** — média ponderada dos 11 critérios. Cada critério tem um peso-multiplicador float entre 0 e 2 (passo 0.1, defeito ×1): ×1 mantém o peso base, ×2 duplica-o e ×0 anula o critério. A média é normalizada pela soma dos multiplicadores, pelo que com todos a ×1 resulta na média simples. Ao alterar um slider, a nota global e o €/ponto mudam imediatamente, sem necessidade de confirmar.
- **Custo-benefício** — `preço / nota global` = euros por ponto. Quanto menor, melhor.
- **Persistência** — os pesos são guardados em `localStorage` com a chave `comparativo-ev-portugal:weights:v2` e recuperados quando o utilizador volta ao site. A tabela e o painel de nota dos dossiês usam a mesma configuração.

O carregamento é um índice composto: **70% potência DC + 30% potência AC**. A quantidade de equipamento é contada sobre a mesma checklist de 38 itens para todos os carros.

## Dados e preços

- Preços de referência para **Portugal Continental**, com IVA, à data indicada em cada JSON.
- CUPRA Raval VZ: proposta `C84TSZ1`, com opcionais, fornecida pelo utilizador. O PDF original está em `public/sources/`.
- BYD Seal Excellence AWD: PVP de referência da Caetano (concessionário oficial BYD). O guia do produto está em `public/sources/`.
- Polestar 4 coupé RM Prime: configuração fornecida pelo utilizador, encomendada em 03/11/2026 com entrega prevista para março–abril de 2027. O total de 56.800 € inclui IVA, legalização, transporte e a oferta indicada no PDF; a versão e o equipamento foram cruzados com a ficha MY27 da Polestar.
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

Rotas atuais: `/carros/cupra-raval-vz`, `/carros/byd-seal-design`, `/carros/byd-seal-excellence-awd` e `/carros/polestar-4-rear-motor-prime`.

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

## Notas de implementação

- O cálculo é feito em Server Components, a partir dos JSONs, sem notas hardcoded nas páginas.
- O ranking aceita qualquer número de carros; a tabela, o rodapé e os dossiês são gerados a partir do registo.
- A tabela é um Client Component porque guarda o estado de ordenação e os pesos; os critérios são calculados no servidor e a nota global é recalculada no browser com os pesos ativos.
- O store de pesos usa `useSyncExternalStore` para manter a tabela e o painel de nota dos dossiês sincronizados com o `localStorage`.
- A definição de cada critério (label, shortLabel, pergunta, descrição e ícone Lucide) vive em `src/data/criteria.ts`. A tabela usa essa mesma definição no tooltip que aparece após 1 segundo de hover.
- O rodapé mostra até quatro dossiês e acrescenta “Ver todos” quando a lista cresce.
- `generateStaticParams` pré-renderiza os dossiês existentes; em desenvolvimento, alterações aos JSONs refletem-se no próximo pedido.
- O projeto não usa imagens de imprensa. O visual é construído com tipografia, cor e dados para evitar dependências de licenciamento.
