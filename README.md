# FlashCard Pro

App completo de flashcards com repetição espaçada, modo vestibular UFPR e dashboard de progresso.

## Stack

- **React 18 + Vite** — frontend
- **Tailwind CSS v3** — estilização com dark/light mode
- **Firebase Auth** — login com Google + email/senha
- **Firebase Firestore** — banco NoSQL em tempo real
- **React Router v6** — navegação
- **Lucide React** — ícones
- **Recharts** — gráficos

## Pré-requisitos

- Node.js 18+
- Conta no Firebase Console

## Criando o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Criar projeto** e siga o wizard
3. Na sidebar, vá em **Authentication** → **Sign-in method**:
   - Ative **Google**
   - Ative **E-mail/senha**
4. Na sidebar, vá em **Firestore Database** → **Criar banco de dados**
   - Selecione **Modo de produção** e escolha a região
5. Em **Configurações do projeto** → **Seus apps**, clique em **</>** (Web app):
   - Registre o app e copie as credenciais `firebaseConfig`
6. No Firestore, vá em **Regras** e cole o conteúdo de `firestore.rules`

## Configurando o .env

Copie `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

```env

```

## Comandos

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy (requer Firebase CLI)
firebase deploy
```

## Estrutura de pastas

```
src/
├── components/
│   ├── Auth/           # Login, ProtectedRoute
│   ├── Deck/           # DeckList, DeckCard, DeckForm
│   ├── Study/          # StudySession, Flashcard, SessionResult
│   ├── Vestibular/     # VestibularConfig, VestibularExam, VestibularResult
│   └── Dashboard.jsx   # Dashboard com gráficos e KPIs
├── hooks/
│   ├── useAuth.js
│   ├── useDecks.js
│   ├── useStudySession.js
│   └── useSpacedRepetition.js
├── services/
│   ├── firebase.js     # Inicialização do Firebase
│   ├── deckService.js  # CRUD de baralhos
│   ├── cardService.js  # CRUD de cards + lógica de fila
│   ├── statsService.js # Sessões e simulados
│   └── seedService.js  # Dados de exemplo (seed automático)
├── context/
│   └── AuthContext.jsx
└── pages/
    ├── Decks.jsx
    ├── Study.jsx
    ├── Vestibular.jsx
    └── Stats.jsx
```

## Funcionalidades

- **Baralhos** — criar, editar, excluir com cards abertos ou múltipla escolha
- **Estudo** — flip 3D, auto-avaliação, repetição espaçada inteligente
- **Pontuação ICE** — Índice de Confiabilidade do Estudo (0–100%)
- **Modo Vestibular** — simulado no estilo UFPR com timer e pontuação oficial
- **Dashboard** — streak, meta diária, gráficos de desempenho
- **Dark/Light mode** — persistido no localStorage
- **Mobile-first** — bottom navigation, funciona em 375px
