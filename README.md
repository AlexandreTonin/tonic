# Tonic

Teoria musical para guitarra, no braço. Gratuito e open source.

**Acesse: https://tonic-app.com.br**

O Tonic conecta teoria e prática: cada escala, acorde, arpejo, intervalo e progressão aparece no braço da guitarra, com som, e se liga aos outros itens da biblioteca. Tudo roda no navegador: não há backend, conta ou banco de dados.

https://github.com/user-attachments/assets/d98ee921-c729-4a3d-b2a0-e65e8d1738c3

## Funcionalidades

**Biblioteca**

- **Escalas**: pentatônicas e blues, os sete modos da escala maior, menor harmônica, menor melódica e escalas simétricas. Cinco posições (CAGED), rótulos em notas ou intervalos, tocar a escala.
- **Licks**: nas pentatônicas e escalas blues, gerador de licks de blues (e também nos modos da escala maior, na menor harmônica e no frígio dominante, cada um sobre o seu acorde: dórico sobre m7, mixolídio sobre 7, frígio dominante sobre 7 etc.) (shuffle, blue notes, bends e releases) na posição escolhida ou atravessando para a seguinte. Estilo, compassos e modo iniciante; tab com a nota tocando destacada; loop, contagem, aceleração a cada volta e base de blues (bateria, baixo e piano); treino de ouvido; licks salvos no navegador; explicação opcional de cada nota (forma da frase, apoios, tensões e resolução sobre o acorde dominante). O lick fica no link e pode ser impresso ou baixado em PNG.
- **Acordes**: tríades, sus e power chords, tétrades, sextas e extensões. Braço com as notas do acorde ou uma forma específica, diagramas de todas as formas com a tônica no baixo, tocar cada forma.
- **Arpejos**: cinco posições e "Toque sobre", com as sobreposições diatônicas (Am7 sobre Fmaj7 soa como 3 5 7 9) e o braço em graus sobre o acorde escolhido.
- **Intervalos**: simples e compostos, com tamanho, inversão, consonância e som subindo, descendo ou junto.
- **Campo harmônico**: maior e menor, tríades ou tétrades, com opção de V7 da menor harmônica e o acorde selecionado em graus do tom.
- **Círculo das quintas**: tons maiores e relativas menores, armaduras, acordes do tom destacados no círculo e tons vizinhos.
- **Progressões**: progressões maiores, menores, blues e jazz em qualquer tom. Loop com guitarra, baixo, piano, bateria e metrônomo (cada faixa pode ser mutada), batidas por compasso e braço sincronizado com a escala para solar sobre cada acorde. Progressão personalizada: monte com acordes do campo harmônico, empréstimos modais e dominantes secundários, ouça no mesmo player, compartilhe pelo link e salve as favoritas no navegador. Substituições para o compasso selecionado (trítono, relativa, empréstimo modal, dominante secundário e ii–V antes), com botão para ouvir e para aplicar. Opção de formas mais próximas: escolhe, para cada acorde, a forma que minimiza o movimento da mão entre os compassos (condução de vozes).
- **Técnica**: exercícios de palhetada, legato, cruzamento de cordas, sweep, tapping e troca de acordes, com padrão em tab, dicas e metrônomo.
- **Ritmo**: padrões com grade, notação e setas de palhetada, loop com vários sons e teste de precisão.

**Treino**

- **Notas no braço**: encontre no braço a nota pedida ou diga qual nota está na casa marcada, escolhendo cordas e região. Sequência, acertos, precisão e melhor tempo salvos no navegador.
- **Ouvido**: reconheça intervalos (subindo, descendo ou juntos), tipos de acorde, escalas e graus do campo harmônico maior em tônica sorteada. Escolha quais opções entram no sorteio; placar por exercício salvo no navegador.
- **Tons e graus**: quiz de campo harmônico maior em tríades ou tétrades (acorde de cada grau, grau de cada acorde) e tons relativos, com placar salvo no navegador.
- **Rotina de estudo**: rotina do dia (ou sorteada) de 15 a 60 minutos com técnica, escala, licks, ritmo e treino de ouvido. Cada bloco abre a tela já configurada, e uma barra no topo acompanha o timer em qualquer tela, com aviso sonoro na troca de bloco.
- **Diário de prática**: botão "Iniciar prática" na barra lateral conta o tempo por tela enquanto você navega. Tempo por dia, últimos 7 dias, sequência de dias, tempo por tela, exportar e importar JSON. Tudo no navegador.

**Ferramentas**

- **Metrônomo**: acentos por tempo, compassos de 2/4 a 12/8, subdivisões, contagem, gap click, speed trainer, timer, atalhos de teclado e predefinições salvas no navegador.
- **Afinador**: pelo microfone, com nota, desvio em cents e a corda mais próxima da afinação escolhida. O áudio é analisado no navegador e não sai dele.
- **Identificador de acordes**: marque as casas no braço e veja o nome do acorde, inversões e outros nomes possíveis, com link para o acorde na biblioteca. As casas ficam no link.
- **Identificador de escalas**: escolha notas e veja as escalas da biblioteca que contêm todas elas, da mais justa para a mais ampla, com link para cada uma.

**Em todo o app**

- Busca com Ctrl+K (ou Cmd+K): páginas, escalas, acordes, arpejos, intervalos, progressões, ritmos e exercícios. Comece com uma nota para já abrir no tom (ex.: "A dórico").
- Atalhos de teclado: espaço toca, setas trocam a tônica, números escolhem a posição nas escalas; `?` mostra os atalhos da tela.

**Em todas as telas com braço**

- Imprimir (A4) ou baixar em PNG exatamente o que está na tela. Nos acordes, também a forma selecionada ou todas as formas.
- Estado na URL: qualquer tela pode ser compartilhada ou salva com as mesmas seleções.
- Afinação: padrão, Drop D, meio tom abaixo, DADGAD, Open G, Open D, 7 cordas e baixo de 4 cordas. Braço, posições, formas de acordes, licks, tab e som seguem a afinação escolhida, que fica salva no navegador e no link.
- Modo canhoto: braço e diagramas de acordes espelhados, também na impressão e no PNG.
- Tema claro e escuro.

## Convenções musicais

- Notas em nomenclatura americana (C, C#, Db…).
- Grafia pelo contexto: cada grau usa a sua letra (Aaug = A C# E#, Adim7 = A C Eb Gb).
- Nunca dobrado sustenido: uma tônica sustenida que geraria `##` vira o bemol enarmônico (A# maior → Bb maior).
- Intervalos como `R b2 2 b3 3 4 #4 5 b6 6 b7 7` e compostos `b9 9 #9 11 #11 b13 13`.
- Graus de acordes em numeral romano maiúsculo com o sufixo do acorde: `IIm7`, `V7`, `bVImaj7`.

Toda a teoria é calculada a partir de fórmulas com [tonal](https://github.com/tonaljs/tonal), sem tabelas de notas digitadas à mão.

## Tecnologias

- [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org) e [Vite](https://vite.dev)
- [TanStack Router](https://tanstack.com/router)
- [Tailwind CSS v4](https://tailwindcss.com) e [shadcn/ui](https://ui.shadcn.com) sobre [Base UI](https://base-ui.com)
- [tonal](https://github.com/tonaljs/tonal) para a teoria musical
- [smplr](https://github.com/danigb/smplr) para os sons (guitarra, baixo, piano e bateria, carregados sob demanda de CDNs públicos)
- Ícones [Lucide](https://lucide.dev)

## Rodando localmente

Requer Node.js 20.19 ou mais recente.

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Typecheck e build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos |
| `npm run format` | Prettier |

### Publicando

O app está publicado no [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) como site estático (`wrangler.jsonc`). O [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) faz o build e o deploy automaticamente a cada push na `main`, com `VITE_SITE_URL` definida nas variáveis de build. Para publicar manualmente:

```bash
VITE_SITE_URL=https://tonic-app.com.br npm run build
npx wrangler deploy
```


O build gera um site estático em `dist/`, que pode ser servido por qualquer hospedagem estática. Como é uma SPA, configure a hospedagem para responder `index.html` em qualquer rota.

Defina `VITE_SITE_URL` com o endereço público no build para gerar `sitemap.xml`, o link canônico de cada tela e as URLs absolutas do Open Graph:

```bash
VITE_SITE_URL=https://seu-dominio.com npm run build
```

## Estrutura

```
src/
  components/   Braço, diagrama de acorde, grade rítmica, controles e UI (shadcn)
  hooks/        Som da guitarra, metrônomo, player de progressões
  lib/
    theory/     Motor de teoria (tonal): escalas, acordes, voicings, campo harmônico, ritmo
    technique/  Catálogo de exercícios
  router/       Uma rota do TanStack Router por arquivo, validação dos parâmetros da URL
  routes/       Telas
```

## Contribuindo

Issues e pull requests são bem-vindos. Antes de mudar uma regra de teoria musical, abra uma issue explicando o caso: grafia de notas, fórmulas e graus são fáceis de errar.

## Apoie o projeto

O Tonic é gratuito e sempre vai ser. Se ele te ajuda a estudar, você pode apoiar o desenvolvimento:

- [GitHub Sponsors](https://github.com/sponsors/alexandretonin)
- [Buy Me a Coffee](https://buymeacoffee.com/alexandretonin)
- Pix (chave aleatória): `24c2b679-a040-409a-83f0-3eec221ab911`

## Licença

[MIT](LICENSE) © Alexandre Tonin
