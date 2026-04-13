# FlashCard Pro — Documentação Técnica

App de flashcards com repetição espaçada inteligente, geração de cards por IA, simulado no estilo Vestibular UFPR e dashboard de progresso. Dados persistidos em tempo real via Firebase Firestore, autenticação via Firebase Auth, e geração de conteúdo via API Groq (LLaMA 3.1).

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Stack](#stack)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Arquivos e suas Funções](#arquivos-e-suas-funções)
5. [Modelo de Dados (Firestore)](#modelo-de-dados-firestore)
6. [Fluxos Principais](#fluxos-principais)
7. [Sistema de Pontuação ICE](#sistema-de-pontuação-ice)
8. [Algoritmo de Repetição Espaçada](#algoritmo-de-repetição-espaçada)
9. [Integração com IA (Groq)](#integração-com-ia-groq)
10. [Variáveis de Ambiente](#variáveis-de-ambiente)
11. [Configurando o Firebase](#configurando-o-firebase)
12. [Como Rodar](#como-rodar)

---

## Visão Geral

O FlashCard Pro é uma SPA (Single Page Application) React que combina quatro modos de uso:

| Modo | Descrição |
|---|---|
| **Baralhos** | Criação e gerenciamento de baralhos e cards (manual ou por IA) |
| **Estudo** | Sessão de revisão com flip 3D, auto-avaliação e repetição espaçada |
| **Vestibular** | Simulado cronometrado com múltipla escolha e pontuação oficial UFPR |
| **Estatísticas** | Dashboard com gráficos de desempenho e histórico de sessões |

Todo o estado persistente vive no Firestore por usuário autenticado. Não há backend próprio — o app é puramente cliente.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | 19.x |
| Build tool | Vite | 8.x |
| Estilização | Tailwind CSS | 3.x |
| Roteamento | React Router DOM | 7.x |
| Autenticação | Firebase Auth | 12.x |
| Banco de dados | Firebase Firestore | 12.x |
| Ícones | Lucide React | 1.x |
| Gráficos | Recharts | 3.x |
| IA generativa | Groq API (LLaMA 3.1 8B) | — |

**Dark mode:** controlado pela classe `dark` no `<html>` via Tailwind (`darkMode: 'class'`), persistido em `localStorage`.

**Fontes:**
- `Satoshi` (corpo) — via Fontshare CDN
- `Instrument Serif` (cards e títulos em destaque) — via Google Fonts

---

## Estrutura de Pastas

```
flashcard-app/
├── public/                     # Arquivos estáticos servidos na raiz
├── src/
│   ├── App.jsx                 # Roteador raiz + layout com sidebar
│   ├── index.css               # Diretivas Tailwind + estilos globais
│   ├── main.jsx                # Ponto de entrada React
│   │
│   ├── context/
│   │   └── AuthContext.jsx     # Provider de autenticação global
│   │
│   ├── hooks/
│   │   ├── useAuth.js          # Re-exporta useAuth do AuthContext
│   │   ├── useDecks.js         # CRUD de baralhos + cards com estado local
│   │   ├── useStudySession.js  # Máquina de estado de uma sessão de estudo
│   │   └── useSpacedRepetition.js  # Algoritmo de pontuação e filas
│   │
│   ├── services/
│   │   ├── firebase.js         # Inicialização do Firebase (auth, db)
│   │   ├── deckService.js      # CRUD Firestore para baralhos
│   │   ├── cardService.js      # CRUD Firestore para cards + getDueCards
│   │   ├── statsService.js     # Leitura/escrita de sessões e simulados
│   │   ├── seedService.js      # Dados de exemplo inseridos no primeiro login
│   │   └── geminiService.js    # Integração Groq/LLaMA para geração de cards
│   │
│   ├── components/
│   │   ├── Dashboard.jsx       # Dashboard com KPIs e gráficos
│   │   ├── Auth/
│   │   │   ├── Login.jsx           # Tela de login (Google + email/senha)
│   │   │   └── ProtectedRoute.jsx  # Guard de rota — redireciona se não autenticado
│   │   ├── Deck/
│   │   │   ├── DeckList.jsx    # Lista de baralhos + busca + botão novo
│   │   │   ├── DeckCard.jsx    # Card individual de baralho com stats de fila
│   │   │   └── DeckForm.jsx    # Modal de criação/edição + modal de IA
│   │   ├── Study/
│   │   │   ├── StudySession.jsx    # Orquestra o carregamento e fluxo da sessão
│   │   │   ├── Flashcard.jsx       # Card com flip 3D + botões de resultado
│   │   │   └── SessionResult.jsx   # Tela de resultado com ICE e resumo
│   │   └── Vestibular/
│   │       ├── VestibularConfig.jsx  # Configuração do simulado (matérias, tempo)
│   │       ├── VestibularExam.jsx    # Interface da prova com timer e flags
│   │       └── VestibularResult.jsx  # Resultado com gabarito e pontuação UFPR
│   │
│   └── pages/
│       ├── Home.jsx        # Redireciona para /decks
│       ├── Decks.jsx       # Página de baralhos
│       ├── Study.jsx       # Página de estudo com cards devidos por baralho
│       ├── Vestibular.jsx  # Página do modo vestibular (config → prova → resultado)
│       └── Stats.jsx       # Página de estatísticas e histórico
│
├── .env                    # Variáveis de ambiente (não versionado)
├── firestore.rules         # Regras de segurança do Firestore
├── index.html              # HTML raiz com links de fontes
├── tailwind.config.js      # Configuração do Tailwind (darkMode, fontes, cores)
├── vite.config.js          # Configuração do Vite
└── package.json
```

---

## Arquivos e suas Funções

### `src/main.jsx`
Ponto de entrada. Renderiza `<App />` dentro de `<StrictMode>`.

---

### `src/App.jsx`
Contém duas responsabilidades:

1. **`useTheme()`** — hook interno que lê/salva o tema em `localStorage` e aplica a classe `dark` no `<html>`.
2. **`AppLayout`** — componente de layout com sidebar fixa (desktop), header mobile e bottom navigation. Gerencia o menu hamburguer e o toggle de tema.
3. **Roteador** — define as rotas públicas (`/login`) e protegidas (`/*`) usando `<ProtectedRoute>`.

**Rotas disponíveis:**

| Caminho | Componente |
|---|---|
| `/login` | `Login` |
| `/dashboard` | `Dashboard` |
| `/decks` | `Decks` |
| `/study` | `Study` |
| `/vestibular` | `Vestibular` |
| `/stats` | `Stats` |
| `/` | Redireciona para `/decks` |

---

### `src/context/AuthContext.jsx`
Provider global de autenticação. Envolve toda a aplicação em `App.jsx`.

**Estado exposto via context:**

| Valor | Tipo | Descrição |
|---|---|---|
| `user` | `FirebaseUser \| null` | Usuário autenticado ou null |
| `loading` | `boolean` | True enquanto `onAuthStateChanged` ainda não respondeu |
| `signInWithGoogle()` | função | Abre popup OAuth Google |
| `signInWithEmail(email, pwd)` | função | Login com email/senha |
| `signUpWithEmail(email, pwd)` | função | Cadastro com email/senha |
| `signOut()` | função | Desloga e limpa estado |

**Lógica de primeiro acesso:** quando `onAuthStateChanged` retorna um usuário cujo documento `users/{uid}` ainda não existe no Firestore, o provider cria o documento com dados padrão e chama `seedUserData(uid)` para popular os 3 baralhos de exemplo (30 cards no total).

---

### `src/hooks/useAuth.js`
Re-exporta `useAuth` de `AuthContext.jsx`. Permite importar de `hooks/` sem depender diretamente do caminho de `context/`.

---

### `src/hooks/useDecks.js`
Gerencia o estado dos baralhos em memória e sincroniza com o Firestore.

**Retorna:**

| Valor | Descrição |
|---|---|
| `decks` | Array de baralhos do usuário |
| `loading` | Boolean de carregamento inicial |
| `addDeck(data)` | Cria baralho e recarrega lista |
| `editDeck(id, data)` | Atualiza baralho |
| `removeDeck(id)` | Exclui baralho |
| `getDeckCards(deckId)` | Retorna cards de um baralho |
| `addCard(deckId, data)` | Cria card |
| `editCard(deckId, cardId, data)` | Atualiza card |
| `removeCard(deckId, cardId)` | Exclui card |
| `refetch()` | Força recarregamento da lista |

---

### `src/hooks/useSpacedRepetition.js`
Implementa toda a lógica do algoritmo de repetição espaçada. Não tem estado — é um hook utilitário puro.

**Função principal:** `processCardResult(result, perceived)` recebe o resultado (`'correct'` ou `'wrong'`) e a dificuldade percebida (`'easy'`, `'medium'`, `'hard'`), retornando `{ points, nextReview, queue }`.

---

### `src/hooks/useStudySession.js`
Máquina de estado para uma sessão de estudo ativa. Depende de `useSpacedRepetition` e persiste cada resposta no Firestore em tempo real.

**Fluxo interno:**
1. `startSession(cards)` inicializa o array de cards e o timestamp de início.
2. Para cada `answerCard(result, perceived)`:
   - Calcula pontos, próxima revisão e fila via `processCardResult`
   - Atualiza o card no Firestore com novo histórico, `iceScore` e `correctRate`
   - Acumula resultado na sessão
3. No último card: calcula estatísticas finais, salva a sessão em `users/{uid}/sessions` e seta `isFinished = true`.

---

### `src/services/firebase.js`
Inicializa o app Firebase com as variáveis de ambiente e exporta:
- `auth` — instância do Firebase Auth
- `db` — instância do Firestore
- `googleProvider` — `GoogleAuthProvider` configurado

---

### `src/services/deckService.js`
CRUD simples para a coleção `users/{uid}/decks`.

| Função | Operação Firestore |
|---|---|
| `getDecks(userId)` | `getDocs` com `orderBy('createdAt', 'desc')` |
| `createDeck(userId, data)` | `addDoc` |
| `updateDeck(userId, deckId, data)` | `updateDoc` com `updatedAt` |
| `deleteDeck(userId, deckId)` | `deleteDoc` |

---

### `src/services/cardService.js`
CRUD para `users/{uid}/decks/{deckId}/cards` e lógica de seleção de cards devidos.

| Função | Descrição |
|---|---|
| `getCards(userId, deckId)` | Lista todos os cards ordenados por `createdAt` |
| `createCard(userId, deckId, data)` | Cria com valores padrão: `queue: 'soon'`, `nextReview: now`, `history: []`, `iceScore: 50` |
| `updateCard(userId, deckId, cardId, data)` | Atualização parcial |
| `deleteCard(userId, deckId, cardId)` | Exclusão |
| `getDueCards(userId, deckIds)` | Filtra cards com `nextReview ≤ agora`, ordena por prioridade de fila (urgent → soon → consolidated) |

---

### `src/services/statsService.js`
Persistência de sessões de estudo e simulados.

| Função | Coleção |
|---|---|
| `saveSession(userId, data)` | `users/{uid}/sessions` |
| `getSessions(userId, limit)` | Leitura com `orderBy('date', 'desc')` |
| `saveSimulation(userId, data)` | `users/{uid}/simulations` |
| `getSimulations(userId)` | Leitura com `orderBy('date', 'desc')` |

---

### `src/services/seedService.js`
Chamada uma única vez no primeiro login. Cria 3 baralhos com 10 cards cada:

| Baralho | Cor | Cards |
|---|---|---|
| Matemática Básica | `#3B82F6` | 6 múltipla escolha + 4 abertas (fácil/médio/difícil) |
| Física | `#F97316` | 6 múltipla escolha + 4 abertas |
| Lógica | `#8B5CF6` | 6 múltipla escolha + 4 abertas |

Todos os cards são criados com `queue: 'soon'` e `nextReview: Timestamp.now()`, ficando disponíveis imediatamente para estudo.

---

### `src/services/geminiService.js`
Integração com a API Groq usando o modelo `llama-3.1-8b-instant`. O arquivo mantém o nome `geminiService.js` por razões históricas, mas a implementação usa Groq.

**Função interna `callGroq(prompt)`:**
- Faz `POST` para `https://api.groq.com/openai/v1/chat/completions` com formato OpenAI
- Header `Authorization: Bearer VITE_GROQ_API_KEY`
- Em caso de `429`, lê o tempo de espera da mensagem de erro e faz retry automático uma vez
- Parseia `choices[0].message.content` como JSON; se falhar, tenta extrair via regex

**Funções exportadas:**

| Função | Entrada | Saída |
|---|---|---|
| `generateCards(tema, quantidade, tipo, dificuldade)` | Parâmetros de geração | Array de cards formatados para o Firestore |
| `generateExplanation(frente, verso)` | Conteúdo do card | String com explicação enriquecida |
| `suggestRelatedCards(deckName, existingCards)` | Nome do baralho + cards existentes | Array de 5 sugestões complementares |

---

### `src/components/Auth/Login.jsx`
Tela de login sem rota de layout. Inclui:
- Toggle entre modo "Entrar" e "Criar conta"
- Botão Google (usa popup OAuth)
- Formulário email/senha com mapeamento de códigos de erro do Firebase para mensagens em português

---

### `src/components/Auth/ProtectedRoute.jsx`
Wrapper simples: exibe spinner enquanto `loading` é `true`; redireciona para `/login` se `user` for `null`; renderiza `children` caso contrário.

---

### `src/components/Dashboard.jsx`
Carrega dados de múltiplas fontes em paralelo (`getDecks` + `getSessions`) e calcula:
- **Streak:** conta dias consecutivos com sessões registradas regressivamente a partir de hoje
- **Meta diária:** cards revisados hoje vs. `dailyGoal: 20`
- **Distribuição de filas:** contagem de cards por `urgent / soon / consolidated`
- **Dados semanais:** últimos 7 dias com contagem de cards e ICE médio
- **Top 5 problemáticos:** cards com menor `iceScore` e histórico não vazio

Usa `BarChart` e `PieChart` do Recharts.

---

### `src/components/Deck/DeckCard.jsx`
Renderiza um baralho em card. Ao montar, busca os cards do baralho para calcular a distribuição de filas. Exibe barra de progresso colorida (vermelho/âmbar/verde) proporcional às filas. Menu de contexto com opções Editar e Excluir.

---

### `src/components/Deck/DeckForm.jsx`
Modal de criação/edição de baralho. Contém dois sub-fluxos:

**Manual:** lista de cards expansíveis com campos de frente, verso, tipo e dificuldade. Cards de múltipla escolha exibem 4 campos de alternativas com radio para marcar a correta.

**IA (componente `AIModal` interno):** abre em cima do `DeckForm` (`z-[60]`), opera em 2 etapas:
1. **Formulário:** tema (input), quantidade (slider 1–10), tipo (2 botões), dificuldade (3 botões)
2. **Preview:** cards gerados expansíveis para edição antes de confirmar; botão "Regerar" volta ao formulário

Ao confirmar, `handleAIConfirm` adiciona os cards ao estado local do `DeckForm`, que os inclui no `onSubmit`.

---

### `src/components/Study/StudySession.jsx`
Container da sessão de estudo. Abre como overlay `fixed inset-0`. Carrega cards devidos via `getDueCards`, inicia a sessão via `useStudySession.startSession`, e alterna entre:
- Loading spinner
- Mensagem "Tudo em dia" (zero cards devidos)
- `<Flashcard>` (sessão em andamento)
- `<SessionResult>` (sessão finalizada)

---

### `src/components/Study/Flashcard.jsx`
Implementa o flip 3D usando CSS inline com `perspective`, `transformStyle: 'preserve-3d'`, `rotateY(180deg)` e `backfaceVisibility: 'hidden'`.

**Cards de múltipla escolha:** alternativas clicáveis que revelam resultado (verde/vermelho) imediatamente, sem botão "Ver resposta".

**Cards abertos:** botão "Ver resposta" dispara o flip; verso exibe botões Acertei/Errei.

Em ambos os casos, após revelar o resultado, o componente exibe os 3 botões de dificuldade percebida (Muito difícil / Médio / Fácil), que disparam `onAnswer(result, perceived)`.

---

### `src/components/Study/SessionResult.jsx`
Exibe o resumo da sessão: ICE em destaque com badge de classificação, grid com pontos/acertos/tempo, lista scrollável de cada card com sua pontuação individual.

---

### `src/components/Vestibular/VestibularConfig.jsx`
Carrega todos os baralhos do usuário e conta quantos cards de múltipla escolha cada um tem. O usuário seleciona quais baralhos incluir e quantas questões de cada (input numérico). Ao clicar em "Iniciar", embaralha aleatoriamente e fatia os cards selecionados, passando `{ deckConfigs, timeLimit }` para a página pai.

---

### `src/components/Vestibular/VestibularExam.jsx`
Interface da prova com:
- **Timer regressivo** (`useEffect` com `setInterval`) — fica vermelho abaixo de 5 minutos; ao chegar a zero, submete automaticamente
- **Sidebar de questões** (desktop) com indicador de respondida/flagada
- **Navegação** Anterior/Próxima e clique direto na sidebar
- **Flags** 🚩 por questão para revisão
- **Modal de confirmação** antes de entregar
- **Opção "Deixar em branco"** remove a resposta selecionada

---

### `src/components/Vestibular/VestibularResult.jsx`
Resultado com pontuação UFPR (`acerto +1,00 / erro −0,25 / branco 0,00`, mínimo 0). Exibe por matéria em acordeão expansível com gabarito completo e explicação dos erros. Compara com nota de corte fictícia de referência.

---

### `src/pages/Vestibular.jsx`
Controla as três fases do modo vestibular: `'config'` → `'exam'` → `'result'`. Ao finalizar o exame, salva o simulado no Firestore via `saveSimulation`.

---

### `src/pages/Stats.jsx`
Carrega sessões (últimas 30) e simulados. Calcula ICE médio, total de cards revisados e minutos estudados. Exibe `LineChart` de ICE por sessão, `BarChart` de pontuação nos simulados, e tabela de histórico detalhado.

---

## Modelo de Dados (Firestore)

```
users/{userId}
  email, name, photoURL, streak, lastStudyDate, dailyGoal, createdAt

users/{userId}/decks/{deckId}
  name, color, category, createdAt, updatedAt

users/{userId}/decks/{deckId}/cards/{cardId}
  front, back, difficulty, type
  options[]           # apenas para type='multiple'
  correctOption       # índice 0–3 da alternativa correta
  queue               # 'urgent' | 'soon' | 'consolidated'
  nextReview          # Timestamp — quando o card deve ser revisado
  history[]           # [{result, perceived, points, date}]
  iceScore            # 0–100 — calculado sobre todo o histórico
  correctRate         # 0–100 — % de acertos no histórico
  createdAt

users/{userId}/sessions/{sessionId}
  deckIds[], date, duration, totalPoints, maxPoints, ice
  cards[]             # [{cardId, deckId, front, result, perceived, points}]

users/{userId}/simulations/{simId}
  config: {deckIds[], timeLimit}
  answers[]           # [{cardId, chosen, correct, blank}]
  score, scoreByDeck, duration, date
```

**Regras de segurança** (`firestore.rules`): qualquer leitura ou escrita sob `users/{userId}/**` só é permitida se `request.auth.uid == userId`. Nenhum dado é compartilhado entre usuários.

---

## Fluxos Principais

### Fluxo de Autenticação

```
Acesso à rota protegida
        ↓
ProtectedRoute verifica loading
        ↓ (loading = false)
  user = null → /login
  user ≠ null → renderiza página

Login bem-sucedido
        ↓
onAuthStateChanged dispara
        ↓
Documento users/{uid} existe?
  Não → cria documento + seedUserData()
  Sim → apenas setUser()
        ↓
Redireciona para /decks
```

---

### Fluxo de Estudo

```
Usuário clica "Estudar" em um baralho
        ↓
StudySession abre como overlay
        ↓
getDueCards filtra cards com nextReview ≤ agora
ordenados: urgent → soon → consolidated
        ↓
useStudySession.startSession(cards)
        ↓
Para cada card:
  1. Flashcard exibe frente
  2. Usuário responde (flip ou seleciona alternativa)
  3. Usuário informa dificuldade percebida
  4. answerCard(result, perceived) →
       - processCardResult() → points, nextReview, queue
       - updateCard() no Firestore
       - acumula em results[]
        ↓
Último card respondido:
  - calcula ICE da sessão
  - saveSession() no Firestore
  - isFinished = true → SessionResult
```

---

### Fluxo de Geração por IA

```
Usuário clica "✨ Gerar com IA" no DeckForm
        ↓
AIModal abre (step='form')
        ↓
Preenche: tema, quantidade, tipo, dificuldade
        ↓
Clica "Gerar N cards"
        ↓
generateCards() → callGroq() → Groq API
  (retry automático em 429)
        ↓
step='preview' → cards gerados editáveis
        ↓
Usuário revisa, edita ou remove cards
        ↓
Clica "Adicionar N cards ao baralho"
        ↓
handleAIConfirm() → cards adicionados ao estado do DeckForm
        ↓
Usuário salva o baralho → cards persistidos no Firestore
```

---

### Fluxo do Vestibular

```
Página Vestibular (phase='config')
        ↓
VestibularConfig: seleciona matérias e tempo
        ↓
onStart({ deckConfigs, timeLimit }) → phase='exam'
        ↓
VestibularExam:
  - Timer regressivo em useEffect
  - Usuário navega questões e marca respostas
  - Flags para revisão
  - Timer zero OU clica "Entregar" → onFinish()
        ↓
phase='result'
        ↓
VestibularResult:
  - Pontuação UFPR calculada
  - Gabarito por matéria em acordeão
        ↓
saveSimulation() persiste no Firestore
```

---

## Sistema de Pontuação ICE

**Matriz de pontos por card** (anti-chute / anti-descuido):

| Resultado | Percebido | Pontos | Lógica |
|---|---|---|---|
| ✅ Acertou | 😰 Muito difícil | **+4** | Domínio real comprovado |
| ✅ Acertou | 😐 Médio | **+3** | Acerto consistente |
| ✅ Acertou | 😊 Fácil | **+2** | Pode ser chute |
| ❌ Errou | 😰 Muito difícil | **−1** | Erro compreensível |
| ❌ Errou | 😐 Médio | **−2** | Lacuna moderada |
| ❌ Errou | 😊 Fácil | **−4** | Descuido grave |

**ICE (Índice de Confiabilidade do Estudo):**

```
ICE = (pontos obtidos / pontos máximos possíveis) × 100
```

O `maxPoints` de uma sessão com N cards é `N × 4` (todos acertados com "muito difícil").
O ICE da sessão nunca é negativo — o total de pontos é clampado em `Math.max(0, total)`.

| ICE | Classificação |
|---|---|
| 80–100% | Excelente |
| 60–79% | Bom |
| 40–59% | Regular |
| 0–39% | Precisa estudar mais |

O `iceScore` de cada card é calculado sobre **todo o histórico** acumulado (não apenas a sessão atual) e atualizado a cada resposta.

---

## Algoritmo de Repetição Espaçada

Implementado em `useSpacedRepetition.js`. Determina a fila e a data da próxima revisão com base no resultado e na dificuldade percebida:

| Resultado | Percebido | Fila | Intervalo |
|---|---|---|---|
| ❌ Erro | 😊 Fácil | `urgent` | 1 dia |
| ❌ Erro | 😐 Médio | `urgent` | 2 dias |
| ❌ Erro | 😰 Difícil | `soon` | 3 dias |
| ✅ Acerto | 😰 Difícil | `soon` | 5 dias |
| ✅ Acerto | 😐 Médio | `soon` | 7 dias |
| ✅ Acerto | 😊 Fácil | `consolidated` | 14 dias |

`getDueCards` filtra cards com `nextReview ≤ agora` e os ordena: `urgent (0) → soon (1) → consolidated (2)`, garantindo que os mais urgentes apareçam primeiro na sessão.

---

## Integração com IA (Groq)

**Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
**Modelo:** `llama-3.1-8b-instant`
**Autenticação:** `Authorization: Bearer VITE_GROQ_API_KEY`
**Formato:** compatível com OpenAI (mensagens `system` + `user`)

O sistema usa um prompt `system` fixo que instrui o modelo a responder sempre com JSON puro. O prompt `user` varia por função e inclui o schema esperado inline para guiar a saída.

**Tratamento de erros:**
- `429 Rate Limit`: lê o campo `"try again in Xs"` do corpo do erro, aguarda o tempo indicado e tenta novamente uma vez
- Outros erros HTTP: propaga com a mensagem da API
- JSON inválido: tenta extrair via regex (`/\[[\s\S]*\]/`) antes de falhar

Chave gratuita disponível em [console.groq.com](https://console.groq.com) — o plano free inclui 14.400 req/dia e 500.000 tokens/dia para `llama-3.1-8b-instant`.

---

## Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
<<<<<<< HEAD
# Firebase — obtenha no Firebase Console > Configurações do projeto
=======
>>>>>>> 2018e7c53c58d287049ec800328bb8da83cdcef5
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
<<<<<<< HEAD

# Groq — obtenha em console.groq.com/keys (gratuito)
=======
# VITE_GEMINI_API_KEY= removida estamos usando Groq agora
>>>>>>> 2018e7c53c58d287049ec800328bb8da83cdcef5
VITE_GROQ_API_KEY=
```

> Todas as variáveis começam com `VITE_` para serem expostas ao cliente pelo Vite. **Nunca** comite o arquivo `.env` com valores reais.

---

## Configurando o Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto.

2. **Authentication** → Sign-in method → ative:
   - **Google**
   - **E-mail/senha**

3. **Firestore Database** → Criar banco → modo **Produção** → escolha região.

4. **Firestore** → Regras → substitua pelo conteúdo de `firestore.rules`:
   ```js
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

5. **Configurações do projeto** → Seus apps → clique em **</>** → registre como Web app → copie o objeto `firebaseConfig` e preencha o `.env`.

6. (Opcional) Para login com Google em produção, adicione o domínio do seu deploy em **Authentication** → Settings → Authorized domains.

---

## Como Rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite .env com suas credenciais

# 3. Iniciar servidor de desenvolvimento
npm run dev
# App disponível em http://localhost:5173

# 4. Build de produção
npm run build

# 5. Pré-visualizar build
npm run preview
```

**Deploy no Firebase Hosting (opcional):**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # aponte para a pasta dist/
npm run build
firebase deploy
```
