# Tonic

Teoria musical para guitarra, no braço. Gratuito e open source.

**Acesse: https://tonic-app.com.br**

O Tonic conecta teoria e prática: cada escala, acorde, arpejo, intervalo e progressão aparece no braço da guitarra, com som, e se liga aos outros itens da biblioteca. Tudo roda no navegador: não há backend, conta ou banco de dados.

<img width="1685" height="698" alt="image" src="https://github.com/user-attachments/assets/44f953c9-3e66-4a77-9d39-2846e50d6d7c" />

## Funcionalidades

**Biblioteca**

- **Escalas**: pentatônicas e blues, os sete modos da escala maior, menor harmônica, menor melódica e escalas simétricas. Cinco posições (CAGED), rótulos em notas ou intervalos, tocar a escala.
- **Licks**: nas pentatônicas e escalas blues, gerador de licks de blues (shuffle, blue notes, bends e releases) na posição escolhida ou atravessando para a seguinte. Estilo, compassos e modo iniciante; tab com a nota tocando destacada; loop, contagem, aceleração a cada volta e base de blues (bateria, baixo e piano); treino de ouvido; licks salvos no navegador; explicação opcional de cada nota (forma da frase, apoios, tensões e resolução sobre o acorde dominante). O lick fica no link e pode ser impresso ou baixado em PNG.
- **Acordes**: tríades, sus e power chords, tétrades, sextas e extensões. Braço com as notas do acorde ou uma forma específica, diagramas de todas as formas com a tônica no baixo, tocar cada forma.
- **Arpejos**: cinco posições e "Toque sobre", com as sobreposições diatônicas (Am7 sobre Fmaj7 soa como 3 5 7 9) e o braço em graus sobre o acorde escolhido.
- **Intervalos**: simples e compostos, com tamanho, inversão, consonância e som subindo, descendo ou junto.
- **Campo harmônico**: maior e menor, tríades ou tétrades, com opção de V7 da menor harmônica e o acorde selecionado em graus do tom.
- **Círculo das quintas**: tons maiores e relativas menores, armaduras, acordes do tom destacados no círculo e tons vizinhos.
- **Progressões**: progressões maiores, menores, blues e jazz em qualquer tom. Loop com guitarra, baixo, piano, bateria e metrônomo (cada faixa pode ser mutada), batidas por compasso e braço sincronizado com a escala para solar sobre cada acorde.
- **Técnica**: exercícios de palhetada, legato, cruzamento de cordas, sweep, tapping e troca de acordes, com padrão em tab, dicas e metrônomo.
- **Ritmo**: padrões com grade, notação e setas de palhetada, loop com vários sons e teste de precisão.

**Ferramentas**

- **Metrônomo**: acentos por tempo, compassos de 2/4 a 12/8, subdivisões, contagem, gap click, speed trainer, timer, atalhos de teclado e predefinições salvas no navegador.

**Em todas as telas com braço**

- Imprimir (A4) ou baixar em PNG exatamente o que está na tela. Nos acordes, também a forma selecionada ou todas as formas.
- Estado na URL: qualquer tela pode ser compartilhada ou salva com as mesmas seleções.
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
