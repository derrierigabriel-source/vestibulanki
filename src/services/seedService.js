import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

const now = () => Timestamp.now()

const DECKS = [
  {
    name: 'Matemática Básica',
    color: '#3B82F6',
    category: 'Exatas',
    cards: [
      {
        front: 'Qual é o resultado de 2³ × 2²?',
        back: 'Quando a base é igual, somamos os expoentes: 2³ × 2² = 2^(3+2) = 2⁵ = 32.',
        difficulty: 'easy',
        type: 'multiple',
        options: ['2⁵', '2⁶', '4⁵', '2¹'],
        correctOption: 0,
      },
      {
        front: 'Qual é a fórmula para calcular a área de um triângulo?',
        back: 'A área do triângulo é sempre metade do produto entre base e altura: A = (b × h) / 2.',
        difficulty: 'medium',
        type: 'multiple',
        options: ['base × altura', '(base × altura) / 2', 'lado²', 'π × raio²'],
        correctOption: 1,
      },
      {
        front: 'Se x² - 5x + 6 = 0, quais são os valores de x?',
        back: 'Fatorando: (x - 2)(x - 3) = 0 → x = 2 ou x = 3. Verifique: 2+3=5 e 2×3=6. ✓',
        difficulty: 'medium',
        type: 'multiple',
        options: ['x = 1 e x = 6', 'x = -2 e x = -3', 'x = 2 e x = 3', 'x = -1 e x = 6'],
        correctOption: 2,
      },
      {
        front: 'Qual é o valor de log₂(128)?',
        back: 'log₂(128) = x significa 2ˣ = 128. Como 2⁷ = 128, a resposta é 7.',
        difficulty: 'hard',
        type: 'multiple',
        options: ['6', '8', '7', '64'],
        correctOption: 2,
      },
      {
        front: 'Uma PA tem a₁ = 3 e razão r = 4. Qual é o 5º termo?',
        back: 'aₙ = a₁ + (n-1) × r → a₅ = 3 + (5-1) × 4 = 3 + 16 = 19.',
        difficulty: 'medium',
        type: 'multiple',
        options: ['18', '20', '19', '23'],
        correctOption: 2,
      },
      {
        front: 'Qual é a derivada de f(x) = x³ - 4x² + 7?',
        back: 'Derivando termo a termo: d/dx(x³) = 3x², d/dx(-4x²) = -8x, d/dx(7) = 0. Logo f\'(x) = 3x² - 8x.',
        difficulty: 'hard',
        type: 'multiple',
        options: ['3x² - 8x', '3x² - 4x', 'x² - 8x', '3x³ - 8x'],
        correctOption: 0,
      },
      {
        front: 'O que é um número primo? Dê três exemplos.',
        back: 'Número primo é divisível apenas por 1 e por ele mesmo. Exemplos: 2, 3, 5, 7, 11, 13...',
        difficulty: 'easy',
        type: 'open',
        options: [],
        correctOption: null,
      },
      {
        front: 'Explique a diferença entre média aritmética e mediana.',
        back: 'Média é a soma dividida pela quantidade. Mediana é o valor central dos dados ordenados. A mediana é menos afetada por outliers.',
        difficulty: 'medium',
        type: 'open',
        options: [],
        correctOption: null,
      },
      {
        front: 'O que é o Teorema de Pitágoras e quando ele se aplica?',
        back: 'Em triângulo retângulo: a² = b² + c². Aplica-se APENAS em triângulos com ângulo de 90°.',
        difficulty: 'hard',
        type: 'open',
        options: [],
        correctOption: null,
      },
      {
        front: 'O que é uma função do 2º grau e como identificar seu gráfico?',
        back: 'f(x) = ax² + bx + c, com a ≠ 0. Gráfico é uma parábola: abre para cima se a > 0, para baixo se a < 0.',
        difficulty: 'medium',
        type: 'open',
        options: [],
        correctOption: null,
      },
    ],
  },
  {
    name: 'Física',
    color: '#F97316',
    category: 'Exatas',
    cards: [
      {
        front: 'Um carro percorre 150 km em 2 horas. Qual é sua velocidade média?',
        back: 'v = Δs / Δt = 150 / 2 = 75 km/h.',
        difficulty: 'easy',
        type: 'multiple',
        options: ['60 km/h', '100 km/h', '75 km/h', '300 km/h'],
        correctOption: 2,
      },
      {
        front: 'Qual é a unidade de medida da força no Sistema Internacional?',
        back: 'Força é medida em Newton (N). 1 N = 1 kg × m/s², conforme F = m × a.',
        difficulty: 'medium',
        type: 'multiple',
        options: ['Joule', 'Watt', 'Newton', 'Pascal'],
        correctOption: 2,
      },
      {
        front: 'Um objeto de 5 kg é acelerado a 3 m/s². Qual é a força resultante?',
        back: 'F = m × a = 5 × 3 = 15 N.',
        difficulty: 'medium',
        type: 'multiple',
        options: ['1,67 N', '8 N', '15 N', '30 N'],
        correctOption: 2,
      },
      {
        front: 'Qual representa corretamente a Lei de Coulomb?',
        back: 'Lei de Coulomb: F = k × q₁q₂/d², onde k = 9×10⁹ N·m²/C².',
        difficulty: 'hard',
        type: 'multiple',
        options: ['F = G × m₁m₂/d²', 'F = k × q₁q₂/d²', 'F = q × v × B', 'F = m × g'],
        correctOption: 1,
      },
      {
        front: 'O que acontece com a pressão de um gás ideal se o volume é reduzido à metade (T constante)?',
        back: 'Lei de Boyle: P₁V₁ = P₂V₂. Se V₂ = V₁/2, então P₂ = 2P₁.',
        difficulty: 'medium',
        type: 'multiple',
        options: ['Diminui à metade', 'Permanece igual', 'Dobra', 'Quadruplica'],
        correctOption: 2,
      },
      {
        front: 'Qual é a energia cinética de um objeto de 4 kg com velocidade de 10 m/s?',
        back: 'Ec = mv²/2 = 4 × 100 / 2 = 200 J.',
        difficulty: 'hard',
        type: 'multiple',
        options: ['40 J', '400 J', '200 J', '80 J'],
        correctOption: 2,
      },
      {
        front: 'Enuncie as 3 Leis de Newton.',
        back: '1ª (Inércia): corpo em repouso ou MRU permanece assim se força resultante for zero. 2ª: F = m × a. 3ª (Ação e Reação): toda ação gera reação igual e oposta.',
        difficulty: 'easy',
        type: 'open',
        options: [],
        correctOption: null,
      },
      {
        front: 'O que é energia potencial gravitacional e de que fatores ela depende?',
        back: 'Energia armazenada pela posição. Ep = m × g × h. Depende de massa, gravidade e altura.',
        difficulty: 'medium',
        type: 'open',
        options: [],
        correctOption: null,
      },
      {
        front: 'Explique o princípio da conservação de energia com um exemplo.',
        back: 'Energia total de sistema isolado é constante — só se transforma. Exemplo: pedra em queda converte Ep em Ec.',
        difficulty: 'hard',
        type: 'open',
        options: [],
        correctOption: null,
      },
      {
        front: 'O que é refração da luz e por que ela ocorre?',
        back: 'Mudança de direção da luz ao passar entre meios de densidades diferentes. A velocidade muda e a luz se desvia. Ex: lápis "quebrado" na água.',
        difficulty: 'medium',
        type: 'open',
        options: [],
        correctOption: null,
      },
    ],
  },
]

export async function seedUserData(userId) {
  for (const deck of DECKS) {
    const { cards, ...deckData } = deck
    const deckRef = await addDoc(collection(db, 'users', userId, 'decks'), {
      ...deckData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    for (const card of cards) {
      await addDoc(collection(db, 'users', userId, 'decks', deckRef.id, 'cards'), {
        ...card,
        queue: 'soon',
        nextReview: now(),
        history: [],
        iceScore: 50,
        correctRate: 0,
        createdAt: serverTimestamp(),
      })
    }
  }
}
