# Treino de combos — spec

Treino de combos de Mortal Kombat 1 (Ghostface + Kameo Scorpion, controle de PS5). Você escolhe um combo e a tela mostra cada botão no momento de apertar: uma trilha estilo jogo de ritmo, o passo atual em destaque, contagem regressiva, cliques nos botões e metrônomo.

O MVP aprovado pelo David está em [`mvp-reference.html`](./mvp-reference.html). Abra no navegador para ver o comportamento esperado. Esta spec descreve como levar o MVP para a arquitetura do template (Lit + TypeScript + tokens), com três mudanças pedidas:

1. **Visual do Mortal Kombat 1**: fontes e paleta parecidas com as do jogo.
2. **Referências de botões padronizadas**: todo botão citado na interface usa o mesmo glifo, vindo de uma única fonte de verdade.
3. **Metrônomo de verdade**: o antigo "Som" só tocava um clique em cada botão. Ele vira a opção "Cliques dos botões", e entra um metrônomo com BPM.

## Já pronto (não reescrever)

Esta parte já foi implementada, testada e passou em `typecheck`, `lint` e `test`:

- **Fontes self-hosted** (importadas em `src/main.ts`):
  - Cinzel Variable para títulos (letras de pedra/metal, como no logo do MK1);
  - Saira Condensed para a UI (rótulos, botões e números, como o HUD do jogo);
  - Saira Semi Condensed para o texto corrido.
- **Tokens** em `src/styles/tokens/foundation.css` e `src/styles/tokens/semantic.css`:
  - paletas obsidian, bone, gold, ember, blood e controller;
  - tema escuro por padrão e tema "pergaminho" no claro;
  - tokens semânticos `--color-*-input-*`, `--color-content-step-*`, `--gradient-brand-metal`, `--typography-font-family-display|ui`, `--size-input-*` e `--radius-input-*`.
- **`src/lib/theme.ts`**: `defaultTheme = 'dark'`.
- **`src/lib/combo/`**:
  - `notation.ts`: notação universal do MK (`1 2 3 4`, `F B U D UF`, `K EX TH`, `+` para juntar botões, `,` para pausa);
  - `combo.types.ts`: tipos `Combo`, `ComboStep`, `ComboSet` e `StepKind`;
  - `controller-layout.ts`: `ps5Layout`, **a única fonte de verdade de como cada botão aparece e é lido**, mais `describeNotation()` para aria-label e `legendTokens`;
  - `rich-text.ts`: textos com notação entre colchetes, por exemplo `Pulo e [2 2] no ar`;
  - `timeline.ts`: `buildTimeline()` calcula o tempo de cada input e agrupa as notas da trilha. Os tempos ficam em `timing`.
- **`src/lib/audio/`**:
  - `metronome.ts`: BPM 90/120/150, contagem de 3 tempos, `beatsInWindow()` e `countInNumber()`;
  - `audio-engine.ts`: `AudioEngine`, que também é o relógio da reprodução (`now()`), com `click()` agendado e `cancelScheduled()`.
- **`src/data/ghostface-scorpion.ts`**: 6 combos completos e 9 peças, com autor e link do mk1kombo.

## O que construir

Siga o `AGENTS.md`:

- tags com prefixo `app-` e uma pasta por componente;
- componentes consomem só tokens semânticos;
- propriedades lógicas no CSS;
- `:focus-visible` em tudo que é interativo;
- todo evento registrado em `HTMLElementEventMap`;
- imports com a extensão `.ts`.

### 1. `src/lib/preferences.ts` (+ teste)

Preferências do treino no `localStorage`, na chave `app:trainer`, com o mesmo padrão defensivo do `theme.ts` (try/catch e validação de cada campo):

```ts
export type PlaybackSpeed = 0.5 | 0.75 | 1;
export interface TrainerPreferences {
  comboId: string | null;
  speed: PlaybackSpeed;
  loop: boolean;
  inputClicks: boolean; // padrão true
  metronomeTempo: MetronomeTempo | null; // padrão null (desligado)
}
export function readTrainerPreferences(storage?): TrainerPreferences;
export function storeTrainerPreferences(prefs, storage?): void;
```

### 2. `src/controllers/playback.controller.ts` (+ teste)

É um `ReactiveController` dono do relógio. O host re-renderiza a cada frame enquanto a reprodução roda.

- **Estado:**
  - `time` em ms de combo: `0` é o primeiro input e valores negativos são a contagem;
  - `playing`, `ended`, `speed`, `loop`, `inputClicks`, `metronomeTempo` e `timeline`.
- **Relógio:** sempre `engine.now()`, nunca `performance.now()` direto. Guarde a âncora `{ clock, time, source: 'audio' | 'page' }`.
  - A cada frame: `time = anchor.time + (engine.now() - anchor.clock) * 1000 * speed`.
  - Se `engine.running` mudar (o áudio libera alguns ms depois do clique), re-ancore mantendo o `time` atual.
- **Agendamento de áudio** (lookahead de 120 ms, para o som sair no tempo exato), a cada frame e só com `engine.running`:
  - `horizon = time + 120 * speed`;
  - para cada `timeline.inputs` com tempo em `(scheduledUntil, horizon]`, se `inputClicks` estiver ligado, chame `engine.click(sound, audioTimeOf(t))`. O som é `kameo` se tiver `K`, `amplify` se tiver `EX`, `direction` se for só direção e `button` nos outros casos;
  - para cada `beatsInWindow(scheduledUntil, horizon, metronomeTempo)`, se o metrônomo estiver ligado, chame `click(accent ? 'downbeat' : 'beat', …)`;
  - `audioTimeOf(t) = anchor.clock + (t - anchor.time) / speed / 1000`, e depois `scheduledUntil = horizon`.
- **Ações:**
  - `play()`: chama `engine.unlock()`, que precisa vir de um clique. Se a reprodução tinha terminado, volta para `-leadInDuration(tempo)`. Re-ancora e define `scheduledUntil = time - 1`, para tocar o primeiro tempo da contagem.
  - `pause()`: cancela o rAF e chama `engine.cancelScheduled()`.
  - `toggle()`.
  - `restart()`: vai para `-leadIn` e dá play.
  - `seek(time)`.
  - `load(timeline)`: pausa e volta para `-leadIn`.
  - `setSpeed()` e `setLoop()`.
  - `setInputClicks()`.
  - `setMetronomeTempo()`: parado na contagem, ajusta `time` para o novo `-leadIn`.
- **Re-agendamento:** `seek`, `setSpeed` e `setMetronomeTempo` re-ancoram, chamam `cancelScheduled()` e definem `scheduledUntil = time`.
- **Fim:** quando `time > duration + timing.tail`:
  - com `loop`, volta para `-leadIn`, re-ancora e continua;
  - sem `loop`, para com `ended = true`.
- **`hostDisconnected`**: cancela o rAF e o áudio agendado.
- **Teste:** use um engine falso (`now`, `running`, `unlock`, `click`, `cancelScheduled`) e `vi.stubGlobal('requestAnimationFrame', …)` para avançar frames manualmente. Cubra:
  - o avanço proporcional à velocidade;
  - que os cliques são agendados uma vez só;
  - o fim com e sem loop;
  - o seek;
  - a contagem.

### 3. Componentes de botão: a padronização

**Regra:** nenhum texto da interface digita `△ ○ ✕ □ → R1`. Todo botão é renderizado por `app-input-glyph`, direto ou via os componentes abaixo. Nos textos dos dados, use notação entre colchetes. Para trocar o layout do controle no futuro (Xbox, por exemplo), basta outro `ControllerLayout`.

- **`app-input-glyph`** (`token`, `size: 'inline' | 'sm' | 'md' | 'lg'`): desenha um token a partir do `ps5Layout`.
  - Formatos:
    - botões de face: círculo com o símbolo em SVG de traço (quadrado, triângulo, X, círculo), na cor `--color-content-input-*`, sobre `--color-bg-input-cap`;
    - direções: quadrado arredondado `--radius-input-direction` com uma seta SVG rotacionada por `rotation`;
    - gatilhos (`R1`, `R2`, `L1`): pílula com `caption`, nas cores `--color-bg-input-kameo|amplify|grab`.
  - Tamanho vem de `--size-input-*`. Use sombra `--shadow-input-cap`.
  - `role="img"` e `aria-label` com `name`.
- **`app-input-sequence`** (`notation`, `size`, `litCount?: number`): renderiza a notação.
  - Botões juntos ficam ligados por `+` (`--color-content-input-joiner`). A pausa aparece como uma vírgula discreta.
  - Com `litCount` definido, os primeiros N presses ficam acesos e o resto apagado (opacidade ~0,28). Ao acender, um "pop" curto de escala, desligado em `prefers-reduced-motion`.
  - O `aria-label` do container vem de `describeNotation()`.
- **`app-notation-text`** (`text`, `size = 'inline'`): usa `parseRichText()` e renderiza o texto com sequências inline.
  - Use em títulos de combo, rótulos de passo, notas e no "Próximo".

### 4. Componentes do treino

- **`app-combo-list`** (`combos`, `selectedId`): abas "Combos" e "Peças" (estado de UI interno), com os itens agrupados por `group`.
  - Cada item mostra o título (via `app-notation-text`) e, embaixo:
    - nos combos, "384 de dano, 18 golpes, 1 barra", com a barra calculada via `countMeterBars`;
    - nas peças, a `description`.
  - Dispara `combo-select` com `{ comboId }`.
  - Abaixo de ~860px vira uma faixa horizontal com rolagem e snap, e os títulos de grupo somem.
- **`app-input-lane`** (`timeline`, `steps`, `time`): a trilha.
  - Notas posicionadas absolutamente. A linha "agora" fica fixa em `max(56px, 18%)` da largura, em `--color-border-brand`, com o rótulo "agora".
  - Algoritmo de posição (o mesmo do MVP), recalculado com `ResizeObserver` e ao trocar `timeline`:
    - `px = clamp(0.18, width / 1700, 0.4)` px/ms;
    - `pos[0] = 0` e `pos[i] = max(pos[i-1] + largura(nota[i-1]) + 10, pos[i-1] + (t[i] - t[i-1]) * px)`;
    - `offset(time)` interpola linearmente entre as notas vizinhas (antes da primeira e depois da última, segue com `px`);
    - `x = hitX + pos[i] - offset(time)`.
  - Assim cada nota cruza a linha exatamente no seu tempo, mesmo nos trechos densos.
  - Classes: `done` para as que passaram, `hot` para a atual. A primeira nota de cada passo leva o número do passo acima dela.
  - Borda da nota pela cor do tipo do passo. Fundo com faixas sutis e máscara de fade nas bordas.
  - Atualize os `transform` sem re-renderizar o template inteiro a cada frame.
- **`app-input-display`**: o painel grande, com props `steps`, `timeline`, `time`, `state: 'ready' | 'count-in' | 'running' | 'ended'`, `countIn: number | null` e um `summary` para o fim. Conteúdo:
  - acima, "Passo 3 de 9" e o rótulo;
  - no centro, o passo atual em `app-input-sequence size="lg"` com `litCount` pelo tempo;
  - a nota do passo em `--color-content-accent`;
  - embaixo, "Próximo: …".
  - Na contagem, mostre o número grande em Cinzel com o gradiente metálico. Em `ready`, mostre um ícone de play. No fim, "Feito" e o dano.
- **`app-combo-steps`** (`steps`, `activeIndex`): lista numerada.
  - Cada linha mostra a sequência (`size="sm"`), o rótulo e a nota ("Troca de lado" quando `swapsSide`) e o tipo à direita em `--color-content-step-*` (Normal, Especial, Kameo, No ar, Final).
  - Linha ativa com borda dourada; as já feitas apagadas.
  - Clique ou Enter dispara `step-seek` com `{ stepIndex }`.
- **`app-playback-controls`**:
  - Play/Pausar (`app-button` primário, largura total no celular) e Reiniciar.
  - Velocidade em botões segmentados (0,5x / 0,75x / 1x, com `aria-pressed`).
  - Repetir (toggle) e **Cliques dos botões** (toggle).
  - **Metrônomo**, segmentado: Desligado / 90 / 120 / 150 BPM. Ao lado, o BPM ouvido na velocidade atual (ex.: "60 bpm em 0,5x", via `effectiveTempo`).
  - Eventos: `playback-toggle`, `playback-restart`, `speed-change {speed}`, `loop-change {loop}`, `input-clicks-change {enabled}`, `metronome-change {tempo}`.
- **`app-combo-trainer`** (`comboSet`): componente de feature com estado.
  - É dono do combo selecionado, do `PlaybackController` e das preferências: lê na montagem e grava a cada mudança.
  - Calcula a timeline com `buildTimeline(combo.steps)` quando o combo muda.
  - Atalho: Espaço alterna o play quando o foco não está em um controle.
  - Layout:
    - acima de ~860px: lista à esquerda (~290px) e palco à direita;
    - abaixo disso: empilhado (lista em faixa, palco, controles, passos).
  - **Palco**:
    - cabeçalho com o título em Cinzel, o meta ("Combo #469 por Therealak1, meio da tela", com link para o mk1kombo) e os números (dano, golpes, barras, duração em 1x) em Saira Condensed;
    - depois `app-input-display`, `app-input-lane` e a barra de progresso;
    - por último a linha: "Ritmo aproximado: o tempo exato depende do hitstun. Comece em 0,5x e ajuste no Modo Treino."
  - Abaixo dos passos, um `<details>` "Legenda dos botões" gerado de `legendTokens` com `app-input-glyph` e o `name`.

### 5. Página, shell e identidade do projeto

- **`src/pages/trainer-page.ts`** (`app-trainer-page`, sem estado, recebe `comboSet`):
  - título "Ghostface + Scorpion" em Cinzel com `--gradient-brand-metal` (texto com `background-clip`);
  - subtítulo "Combos de Mortal Kombat 1 no controle de PS5. Escolha um combo e toque em Tocar.";
  - por fim `<app-combo-trainer>`.
- **`app-root`**: o treino é público e aparece em todos os estados de auth. O login Google continua disponível, e serve para recursos futuros como favoritos.
  - `loading`: mostre o treino mesmo assim.
  - `signed-out`: o header mostra o botão "Entrar", que dispara `sign-in` e chama `auth.signInWithGoogle()`.
  - `unconfigured`: sem botão de entrar.
  - `signed-in`: avatar e "Sair", como hoje.
  - `home-page`, `login-page` e `setup-page` podem ficar no repo, mas sem uso no shell.
- **Header:** marca "Receba" em Cinzel dourado e um filete dourado (`--color-border-brand-subtle`) na base. O theme toggle continua.
- **Identidade:** aplique o `.template/manifest.json` à mão:
  - `name: app-receba`;
  - `title: Receba`;
  - descrição "Treino de combos de Mortal Kombat 1 com a sequência de botões no tempo certo.";
  - aplicar em `package.json` (versão `0.0.0`), `index.html`, `README.md` (remova o bloco `template:remove` e adicione uma seção curta sobre o treino), `AGENTS.md` (título) e `src/config/app.config.ts`.
  - Não apague `.template/` nem `CHANGELOG.md`: deletar arquivos exige permissão do David.
- **`index.html`:** o script de tema já restaura o tema salvo. Sem tema salvo, fica escuro pelo token.

## Visual Mortal Kombat 1

- **Fundo:** obsidiana quente (`--color-bg-subtle`). Superfícies em `--color-bg-default` com borda `--color-border-default`. Destaques e selecionados com borda `--color-border-brand` e fundo `--color-bg-brand-subtle`.
- **Cantos:** retos (`--radius-control` e `--radius-surface`). Só os botões do controle são redondos.
- **Títulos** (Cinzel, `--typography-font-family-display`): peso 700, `letter-spacing` `--typography-display-letter-spacing`, caixa alta só no título principal e na marca.
- **UI** (`--typography-font-family-ui`, Saira Condensed): rótulos de aba, botão e estatística em caixa alta com `--typography-label-letter-spacing`. Números grandes em `--typography-figure-size`.
- **Cores:** dourado é a cor de destaque e a brasa (`--color-content-accent`) marca a nota do passo atual. Sangue só para EX e finalizador.
- **Movimento:** só a trilha e o "pop" do botão aceso. Todo o resto é estático, e `prefers-reduced-motion` desliga o pop.

## Critérios de aceite

- `npm run verify` verde, com lint, format, typecheck, testes e build.
- Testes novos para `preferences`, `playback.controller`, `app-input-glyph`, `app-input-sequence` e `app-notation-text`, com renderização e aria-label.
- Funciona em 390px sem rolagem lateral e em 1280px. No celular, a ordem é: título, faixa de combos, palco, controles, passos.
- **Metrônomo ligado:**
  - a contagem 3, 2, 1 coincide com os cliques;
  - o primeiro input cai no tempo forte;
  - em 0,5x o BPM ouvido é a metade.
- **Cliques dos botões:** soam exatamente quando cada nota cruza a linha "agora".
- Trocar de combo pausa e volta para a contagem. Preferências e último combo sobrevivem ao recarregar.
- Nenhum símbolo de botão digitado como texto em componentes ou dados: `grep -rn "[△○✕□]" src` não retorna nada.
- Não faça commit: o David revisa e decide.
