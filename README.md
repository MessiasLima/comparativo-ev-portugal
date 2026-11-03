# Comparativo EV Portugal

Comparador de carros elétricos do mercado português. O site tem duas vistas principais:

- **Home (`/`)** — hero e uma tabela única de ranking com nota global, os dez critérios e o custo em €/ponto. Qualquer coluna pode ser usada para ordenar, com atalhos para “Melhor nota” e “Melhor custo-benefício”. O botão Pesos abre um modal para ajustar o peso de cada critério; ao mover os sliders, a nota global, o €/ponto e o ranking são recalculados em tempo real (com pré-visualização dentro do modal) e a configuração fica guardada no `localStorage` do browser. Cancelar repõe os pesos que estavam ativos ao abrir o modal.
- **Dossiê (`/carros/[slug]`)** — visão geral, ficha técnica, critérios de avaliação (3.1 a 3.10), equipamento, informações adicionais e fontes.

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
│   └── byd-seal-excellence-awd.json
├── criteria.ts                   # os 10 critérios
├── equipment.ts                  # checklist normalizada de 38 equipamentos
├── site.ts                       # data editorial da lista
└── types.ts                      # tipos do modelo de dados

src/lib/weights.ts                # pesos padrão, validação e persistência
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

- **Critérios objetivos** — autonomia, potência/peso, eficiência, carregamento e quantidade de equipamento. O valor é calculado a partir dos dados do JSON.
- **Critérios editoriais** — acabamento, conforto, marca, som e satisfação. Cada carro tem uma avaliação base de 0 a 10, sustentada por fontes no próprio JSON.
- **Relatividade** — em cada critério, o melhor carro da lista recebe 10. Os restantes recebem a proporção do seu desempenho face ao líder. Se entrar um carro novo, as notas de todos mudam.
- **Nota global** — média ponderada dos 10 critérios. Cada critério tem um peso-multiplicador float entre 0 e 2 (passo 0.1, defeito ×1): ×1 mantém o peso base, ×2 duplica-o e ×0 anula o critério. A média é normalizada pela soma dos multiplicadores, pelo que com todos a ×1 resulta na média simples. Ao alterar um slider, a nota global e o €/ponto mudam imediatamente, sem necessidade de confirmar.
- **Custo-benefício** — `preço / nota global` = euros por ponto. Quanto menor, melhor.
- **Persistência** — os pesos são guardados em `localStorage` com a chave `comparativo-ev-portugal:weights:v2` e recuperados quando o utilizador volta ao site. A tabela e o painel de nota dos dossiês usam a mesma configuração.

O carregamento é um índice composto: **70% potência DC + 30% potência AC**. A quantidade de equipamento é contada sobre a mesma checklist de 38 itens para todos os carros.

## Dados e preços

- Preços de referência para **Portugal Continental**, com IVA, à data indicada em cada JSON.
- CUPRA Raval VZ: proposta `C84TSZ1`, com opcionais, fornecida pelo utilizador. O PDF original está em `public/sources/`.
- BYD Seal Excellence AWD: PVP de referência da Caetano (concessionário oficial BYD). O guia do produto está em `public/sources/`.
- Autonomia e consumo são **WLTP**. Os valores reais variam com percurso, clima, carga e estilo de condução.
- As avaliações editoriais são uma síntese de imprensa especializada, dados oficiais e testemunhos de proprietários. As fontes estão listadas em cada dossiê.

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Hero + tabela de ranking ordenável + metodologia |
| `/carros/[slug]` | Dossiê gerado para cada carro registado |

Rotas atuais: `/carros/cupra-raval-vz`, `/carros/byd-seal-design` e `/carros/byd-seal-excellence-awd`.

## Notas de implementação

- O cálculo é feito em Server Components, a partir dos JSONs, sem notas hardcoded nas páginas.
- O ranking aceita qualquer número de carros; a tabela, o rodapé e os dossiês são gerados a partir do registo.
- A tabela é um Client Component porque guarda o estado de ordenação e os pesos; os critérios são calculados no servidor e a nota global é recalculada no browser com os pesos ativos.
- O store de pesos usa `useSyncExternalStore` para manter a tabela e o painel de nota dos dossiês sincronizados com o `localStorage`.
- A definição de cada critério (label, shortLabel, pergunta, descrição e ícone Lucide) vive em `src/data/criteria.ts`. A tabela usa essa mesma definição no tooltip que aparece após 1 segundo de hover.
- O rodapé mostra até quatro dossiês e acrescenta “Ver todos” quando a lista cresce.
- `generateStaticParams` pré-renderiza os dossiês existentes; em desenvolvimento, alterações aos JSONs refletem-se no próximo pedido.
- O projeto não usa imagens de imprensa. O visual é construído com tipografia, cor e dados para evitar dependências de licenciamento.
