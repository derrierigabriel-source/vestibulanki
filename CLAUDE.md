# CLAUDE.md — Flashcard App (Projeto Completo)

## VISÃO GERAL

Crie um app completo de flashcards com sistema de estudo inteligente.
Projeto React moderno, robusto, com autenticação real e banco de dados.

---

## STACK

- **React 18 + Vite** — frontend
- **Tailwind CSS** — estilização com dark/light mode (`darkMode: 'class'`)
- **Firebase Auth** — login com Google + email/senha
- **Firebase Firestore** — banco NoSQL em tempo real
- **React Router v6** — navegação entre páginas
- **Lucide React** — ícones
- **Recharts** — gráficos do dashboard

---

## PASSO 1 — SETUP INICIAL

Execute na ordem:

```bash
npm create vite@latest flashcard-app -- --template react
cd flashcard-app
npm install
npm install firebase react-router-dom lucide-react recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure o `tailwind.config.js`:
```js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Crie o arquivo `.env` na raiz (use `.env.example` como template):
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## PASSO 2 — ESTRUTURA DE PASTAS

```
flashcard-app/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── Deck/
│   │   │   ├── DeckList.jsx
│   │   │   ├── DeckCard.jsx
│   │   │   └── DeckForm.jsx
│   │   ├── Study/
│   │   │   ├── StudySession.jsx
│   │   │   ├── Flashcard.jsx
│   │   │   └── SessionResult.jsx
│   │   ├── Vestibular/
│   │   │   ├── VestibularConfig.jsx
│   │   │   ├── VestibularExam.jsx
│   │   │   └── VestibularResult.jsx
│   │   └── Auth/
│   │       ├── Login.jsx
│   │       └── ProtectedRoute.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDecks.js
│   │   ├── useStudySession.js
│   │   └── useSpacedRepetition.js
│   ├── services/
│   │   ├── firebase.js
│   │   ├── deckService.js
│   │   ├── cardService.js
│   │   └── statsService.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Decks.jsx
│   │   ├── Study.jsx
│   │   ├── Vestibular.jsx
│   │   └── Stats.jsx
│   └── App.jsx
├── firestore.rules
├── .env
├── .env.example
└── README.md
```

---

## PASSO 3 — MODELO DE DADOS (FIRESTORE)

```
users/{userId}
  - email, name, photoURL
  - streak (number)
  - lastStudyDate (timestamp)
  - dailyGoal (number, default: 20)

users/{userId}/decks/{deckId}
  - name (string)
  - color (string, hex)
  - category (string)
  - createdAt (timestamp)
  - updatedAt (timestamp)

users/{userId}/decks/{deckId}/cards/{cardId}
  - front (string)
  - back (string)
  - difficulty ('easy' | 'medium' | 'hard')
  - type ('open' | 'multiple')
  - options (array, só para múltipla escolha)
  - correctOption (number, índice da correta)
  - queue ('urgent' | 'soon' | 'consolidated')
  - nextReview (timestamp)
  - history: [{ result, perceived, points, date }]
  - iceScore (number, 0-100)
  - correctRate (number, 0-100)

users/{userId}/sessions/{sessionId}
  - deckIds (array)
  - date (timestamp)
  - duration (number, segundos)
  - totalPoints (number)
  - maxPoints (number)
  - ice (number, 0-100)
  - cards: [{ cardId, result, perceived, points }]

users/{userId}/simulations/{simId}
  - config: { deckIds, timeLimit, questionsPerDeck }
  - answers: [{ cardId, chosen, correct, blank }]
  - score (number)
  - scoreByDeck (object)
  - date (timestamp)
  - duration (number, segundos)
```

---

## PASSO 4 — AUTENTICAÇÃO

Arquivo `src/context/AuthContext.jsx`:
- Provedor global de autenticação
- Expõe: `user`, `loading`, `signInWithGoogle()`, `signInWithEmail()`, `signOut()`
- Ao criar usuário pela primeira vez: chamar `seedUserData(userId)` para inserir os baralhos de exemplo

Arquivo `src/components/Auth/ProtectedRoute.jsx`:
- Redireciona para `/login` se não autenticado
- Mostra loading spinner enquanto verifica auth

---

## PASSO 5 — FUNCIONALIDADES DETALHADAS

### 5.1 BARALHOS E CARDS

Cada baralho tem: nome, cor (picker de cor) e categoria.

Cada flashcard tem:
- Frente (pergunta/conceito)
- Verso (resposta/explicação)
- Dificuldade base: Fácil / Médio / Difícil
- Tipo: Aberta (livre) ou Múltipla escolha (4 alternativas, 1 correta)

Funcionalidades: criar, editar, deletar cards, importar/exportar baralhos como JSON.

---

### 5.2 MODO ESTUDO — fluxo por card

1. Exibe a frente do card
2. Usuário clica "Ver resposta"
3. Exibe o verso com animação flip 3D (CSS transform)
4. Usuário informa:
   - ✅ Acertou ou ❌ Errou
   - 😰 Muito difícil / 😐 Médio / 😊 Fácil (auto-avaliação de dificuldade percebida)
5. Sistema calcula pontos e atualiza fila de repetição
6. Ao final: tela de resultado com ICE, pontos, e resumo da sessão

---

### 5.3 SISTEMA DE PONTUAÇÃO INTELIGENTE

Matriz de pontos (anti-chute / anti-descuido):

| Resultado | Dificuldade Percebida | Pontos | Lógica |
|---|---|---|---|
| ✅ Acertou | 😰 Muito difícil | +4 | Domínio real |
| ✅ Acertou | 😐 Médio | +3 | Acerto consistente |
| ✅ Acertou | 😊 Fácil | +2 | Pode ser chute |
| ❌ Errou | 😰 Muito difícil | -1 | Erro compreensível |
| ❌ Errou | 😐 Médio | -2 | Lacuna moderada |
| ❌ Errou | 😊 Fácil | -4 | Descuido grave |

Pontuação mínima por sessão: 0 (nunca fica negativo).

**ICE — Índice de Confiabilidade do Estudo:**
- Fórmula: `ICE = (pontos obtidos / pontos máximos possíveis) × 100`
- 80–100%: Excelente | 60–79%: Bom | 40–59%: Regular | 0–39%: Precisa estudar mais

**Flags automáticas por card:**
- ⚠️ "Possível chute": acertou muito mas sempre marcou como difícil
- ⚠️ "Descuido recorrente": errou muito em cards marcados como fácil

---

### 5.4 ALGORITMO DE REPETIÇÃO ESPAÇADA

Sistema de filas baseado em acerto + dificuldade percebida:

| Condição | Fila | Intervalo |
|---|---|---|
| Erro + fácil percebido | Urgente | 1 dia |
| Erro + médio percebido | Urgente | 2 dias |
| Erro + difícil percebido | Em breve | 3 dias |
| Acerto + difícil percebido | Em breve | 5 dias |
| Acerto + médio percebido | Em breve | 7 dias |
| Acerto + fácil percebido | Consolidado | 14 dias |

Sessão de estudo prioriza cards da fila Urgente, depois Em breve, depois Consolidado.

---

### 5.5 MODO VESTIBULAR UFPR

**Configuração do simulado:**
- Selecionar quais baralhos/matérias incluir
- Definir quantidade de questões por matéria
- Tempo total configurável (padrão: 5h, ou proporcional)
- Apenas questões de múltipla escolha são usadas

**Pontuação oficial UFPR:**
- Acerto: +1,00 ponto
- Erro: -0,25 ponto
- Em branco: 0,00 ponto
- Mínimo: 0 (não fica negativo)

**Interface da prova:**
- Modo foco (sidebar colapsada, sem distrações)
- Timer regressivo visível e destacado
- Barra de progresso por matéria
- Botão de flag 🚩 para marcar questões para revisão
- Gabarito oculto até submeter ou o tempo acabar

**Tela de resultado:**
- Gabarito completo com todas as questões
- Pontuação total e por matéria
- Comparativo: "Na UFPR 2024, a nota de corte foi X pontos" (valor fictício de referência)
- Análise: melhores e piores matérias
- Lista de questões erradas com explicação

**Histórico de simulados:**
- Gráfico de linha com evolução da pontuação ao longo do tempo
- Tabela comparativa por matéria entre simulados

---

### 5.6 DASHBOARD

- 🔥 Streak de dias estudados consecutivos
- Cards estudados hoje / meta diária (barra de progresso)
- Gráfico de barras: desempenho dos últimos 7 dias
- Gráfico donut: distribuição de cards por fila (Urgente / Em breve / Consolidado)
- Top 5 cards mais problemáticos (menor ICE histórico)
- Próxima sessão recomendada com base nas filas

---

## PASSO 6 — DESIGN E UX

**Visual:**
- Dark/Light mode com toggle no header (salvo em localStorage)
- Paleta: tons neutros quentes como base, verde-azulado (#0D9488) como accent primário
- Fontes: `Satoshi` (corpo, via Fontshare CDN) + `Instrument Serif` (destaque nos cards, Google Fonts)
- Estilo: inspiração Anki + Duolingo + Linear — clean, moderno, app de produtividade
- Evitar gradientes roxos genéricos — preferir fundos com sutil textura ou mesh gradient suave

**Animações:**
- Flip 3D nos cards: `transform: rotateY(180deg)` com `perspective` e `transform-style: preserve-3d`
- Transições suaves entre páginas (fade + slide)
- Micro-interações nos botões (scale, shadow on hover)

**Mobile-first:**
- Funciona perfeitamente em 375px
- Bottom navigation bar no mobile
- Sidebar colapsável no desktop

---

## PASSO 7 — DADOS DE EXEMPLO (SEED)

Inserir automaticamente no Firestore na primeira vez que o usuário fizer login (função `seedUserData`).

---

### Baralho: Matemática Básica — cor: #3B82F6 — categoria: Exatas

**Card 1** — Múltipla escolha — Fácil
Frente: Qual é o resultado de 2³ × 2²?
A) 2⁵ ✓  B) 2⁶  C) 4⁵  D) 2¹
Verso: Quando a base é igual, somamos os expoentes: 2³ × 2² = 2^(3+2) = 2⁵ = 32.

**Card 2** — Múltipla escolha — Médio
Frente: Qual é a fórmula para calcular a área de um triângulo?
A) base × altura  B) (base × altura) / 2 ✓  C) lado²  D) π × raio²
Verso: A área do triângulo é sempre metade do produto entre base e altura: A = (b × h) / 2.

**Card 3** — Múltipla escolha — Médio
Frente: Se x² - 5x + 6 = 0, quais são os valores de x?
A) x = 1 e x = 6  B) x = -2 e x = -3  C) x = 2 e x = 3 ✓  D) x = -1 e x = 6
Verso: Fatorando: (x - 2)(x - 3) = 0 → x = 2 ou x = 3. Verifique: 2+3=5 e 2×3=6. ✓

**Card 4** — Múltipla escolha — Difícil
Frente: Qual é o valor de log₂(128)?
A) 6  B) 8  C) 7 ✓  D) 64
Verso: log₂(128) = x significa 2ˣ = 128. Como 2⁷ = 128, a resposta é 7.

**Card 5** — Múltipla escolha — Médio
Frente: Uma PA tem a₁ = 3 e razão r = 4. Qual é o 5º termo?
A) 18  B) 20  C) 19 ✓  D) 23
Verso: aₙ = a₁ + (n-1) × r → a₅ = 3 + (5-1) × 4 = 3 + 16 = 19.

**Card 6** — Múltipla escolha — Difícil
Frente: Qual é a derivada de f(x) = x³ - 4x² + 7?
A) 3x² - 8x ✓  B) 3x² - 4x  C) x² - 8x  D) 3x³ - 8x
Verso: Derivando termo a termo: d/dx(x³) = 3x², d/dx(-4x²) = -8x, d/dx(7) = 0. Logo f'(x) = 3x² - 8x.

**Card 7** — Aberta — Fácil
Frente: O que é um número primo? Dê três exemplos.
Verso: Número primo é divisível apenas por 1 e por ele mesmo. Exemplos: 2, 3, 5, 7, 11, 13...

**Card 8** — Aberta — Médio
Frente: Explique a diferença entre média aritmética e mediana.
Verso: Média é a soma dividida pela quantidade. Mediana é o valor central dos dados ordenados. A mediana é menos afetada por outliers.

**Card 9** — Aberta — Difícil
Frente: O que é o Teorema de Pitágoras e quando ele se aplica?
Verso: Em triângulo retângulo: a² = b² + c². Aplica-se APENAS em triângulos com ângulo de 90°.

**Card 10** — Aberta — Médio
Frente: O que é uma função do 2º grau e como identificar seu gráfico?
Verso: f(x) = ax² + bx + c, com a ≠ 0. Gráfico é uma parábola: abre para cima se a > 0, para baixo se a < 0.

---

### Baralho: Física — cor: #F97316 — categoria: Exatas

**Card 1** — Múltipla escolha — Fácil
Frente: Um carro percorre 150 km em 2 horas. Qual é sua velocidade média?
A) 60 km/h  B) 100 km/h  C) 75 km/h ✓  D) 300 km/h
Verso: v = Δs / Δt = 150 / 2 = 75 km/h.

**Card 2** — Múltipla escolha — Médio
Frente: Qual é a unidade de medida da força no Sistema Internacional?
A) Joule  B) Watt  C) Newton ✓  D) Pascal
Verso: Força é medida em Newton (N). 1 N = 1 kg × m/s², conforme F = m × a.

**Card 3** — Múltipla escolha — Médio
Frente: Um objeto de 5 kg é acelerado a 3 m/s². Qual é a força resultante?
A) 1,67 N  B) 8 N  C) 15 N ✓  D) 30 N
Verso: F = m × a = 5 × 3 = 15 N.

**Card 4** — Múltipla escolha — Difícil
Frente: Qual representa corretamente a Lei de Coulomb?
A) F = G × m₁m₂/d²  B) F = k × q₁q₂/d² ✓  C) F = q × v × B  D) F = m × g
Verso: Lei de Coulomb: F = k × q₁q₂/d², onde k = 9×10⁹ N·m²/C².

**Card 5** — Múltipla escolha — Médio
Frente: O que acontece com a pressão de um gás ideal se o volume é reduzido à metade (T constante)?
A) Diminui à metade  B) Permanece igual  C) Dobra ✓  D) Quadruplica
Verso: Lei de Boyle: P₁V₁ = P₂V₂. Se V₂ = V₁/2, então P₂ = 2P₁.

**Card 6** — Múltipla escolha — Difícil
Frente: Qual é a energia cinética de um objeto de 4 kg com velocidade de 10 m/s?
A) 40 J  B) 400 J  C) 200 J ✓  D) 80 J
Verso: Ec = mv²/2 = 4 × 100 / 2 = 200 J.

**Card 7** — Aberta — Fácil
Frente: Enuncie as 3 Leis de Newton.
Verso: 1ª (Inércia): corpo em repouso ou MRU permanece assim se força resultante for zero. 2ª: F = m × a. 3ª (Ação e Reação): toda ação gera reação igual e oposta.

**Card 8** — Aberta — Médio
Frente: O que é energia potencial gravitacional e de que fatores ela depende?
Verso: Energia armazenada pela posição. Ep = m × g × h. Depende de massa, gravidade e altura.

**Card 9** — Aberta — Difícil
Frente: Explique o princípio da conservação de energia com um exemplo.
Verso: Energia total de sistema isolado é constante — só se transforma. Exemplo: pedra em queda converte Ep em Ec.

**Card 10** — Aberta — Médio
Frente: O que é refração da luz e por que ela ocorre?
Verso: Mudança de direção da luz ao passar entre meios de densidades diferentes. A velocidade muda e a luz se desvia. Ex: lápis "quebrado" na água.

---

### Baralho: Lógica — cor: #8B5CF6 — categoria: Raciocínio

**Card 1** — Múltipla escolha — Fácil
Frente: Se "Todo A é B" e "Todo B é C", o que podemos concluir?
A) Todo C é A  B) Todo A é C ✓  C) Nenhum A é C  D) Algum C não é A
Verso: Silogismo: se A ⊂ B e B ⊂ C, então A ⊂ C.

**Card 2** — Múltipla escolha — Médio
Frente: Qual é a negação de "Todos os alunos passaram"?
A) Nenhum passou  B) Pelo menos um não passou ✓  C) A maioria não passou  D) Todos reprovaram
Verso: Negação de "Todo A é B" é "Existe pelo menos um A que não é B".

**Card 3** — Múltipla escolha — Médio
Frente: Quando uma implicação (P → Q) é FALSA?
A) P falso e Q verdadeiro  B) P verdadeiro e Q falso ✓  C) P e Q falsos  D) P e Q verdadeiros
Verso: P → Q só é falsa quando P é verdadeiro e Q é falso.

**Card 4** — Múltipla escolha — Difícil
Frente: Qual completa o padrão? 2, 6, 12, 20, 30, ___
A) 40  B) 42 ✓  C) 44  D) 36
Verso: Diferenças: 4, 6, 8, 10, 12... (crescem de 2 em 2). Logo 30 + 12 = 42.

**Card 5** — Múltipla escolha — Médio
Frente: Ana é mais velha que Bruno. Carlos é mais novo que Bruno. Quem é o mais velho?
A) Bruno  B) Carlos  C) Ana ✓  D) Impossível determinar
Verso: Ordem: Ana > Bruno > Carlos. Ana é a mais velha.

**Card 6** — Múltipla escolha — Difícil
Frente: P é verdadeiro e Q é falso. Qual o valor de (P ∧ Q) ∨ (¬P ∨ Q)?
A) Verdadeiro  B) Falso ✓  C) Indeterminado  D) Depende do contexto
Verso: P∧Q = F. ¬P∨Q = F∨F = F. F∨F = Falso.

**Card 7** — Aberta — Fácil
Frente: O que é um argumento dedutivo válido?
Verso: Se as premissas forem verdadeiras, a conclusão necessariamente também será. Validade diz respeito à forma, não ao conteúdo.

**Card 8** — Aberta — Médio
Frente: Explique a diferença entre dedução e indução.
Verso: Dedução: do geral ao particular — conclusão certa se premissas forem verdadeiras. Indução: do particular ao geral — conclusão provável, nunca certa.

**Card 9** — Aberta — Difícil
Frente: O que é o Paradoxo do Mentiroso? Por que é problemático?
Verso: "Esta frase é falsa." Se verdadeira, é falsa. Se falsa, é verdadeira. Viola o princípio da não-contradição.

**Card 10** — Aberta — Médio
Frente: O que são falácias lógicas? Dê dois exemplos.
Verso: Erros de raciocínio que parecem válidos. Ex: Ad Hominem (atacar a pessoa) e Homem de Palha (distorcer o argumento alheio).

---

## PASSO 8 — REGRAS DE SEGURANÇA (firestore.rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## PASSO 9 — README.md

Gere um README com:
1. Descrição do projeto
2. Stack utilizada
3. Pré-requisitos
4. Como criar o projeto no Firebase Console (passo a passo)
5. Como configurar o `.env`
6. Comandos: `npm run dev`, `npm run build`, `firebase deploy`
7. Estrutura de pastas explicada

---

## ENTREGÁVEIS ESPERADOS

- [ ] Projeto React completo e funcional
- [ ] Autenticação com Google e email/senha funcionando
- [ ] Firestore integrado com todas as operações CRUD
- [ ] Seed automático dos 3 baralhos de exemplo no primeiro login
- [ ] Todas as 6 funcionalidades implementadas e funcionando
- [ ] Dark/light mode
- [ ] Mobile-first (375px)
- [ ] Animação flip 3D nos cards
- [ ] `.env.example` com todas as variáveis
- [ ] `firestore.rules` com segurança por userId
- [ ] `README.md` completo

**Construa o projeto completo, funcional e com design sofisticado. Priorize que todas as features funcionem de verdade no browser.**
