const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

async function callGroq(prompt) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY não configurada no .env.')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content:
            'Você é um professor especialista em criação de flashcards educativos. Responda SEMPRE com JSON puro e válido, sem markdown, sem explicações fora do JSON.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (res.status === 429) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || ''
    const retryMatch = msg.match(/try again in ([\d.]+)s/i)
    const waitMs = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) * 1000 : 10000
    await new Promise((r) => setTimeout(r, waitMs))
    return callGroq(prompt) // retry once
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Erro HTTP ${res.status}`)
  }

  const data = await res.json()
  const raw = data?.choices?.[0]?.message?.content
  if (!raw) throw new Error('Resposta vazia da API Groq.')

  try {
    return JSON.parse(raw)
  } catch {
    const match = raw.match(/\[[\s\S]*\]/) || raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Não foi possível interpretar a resposta da IA.')
  }
}

/**
 * Gera cards automaticamente para um dado tema.
 * @param {string} tema - Assunto dos cards
 * @param {number} quantidade - Número de cards (1–10)
 * @param {'open'|'multiple'} tipo - Tipo dos cards
 * @param {'easy'|'medium'|'hard'} dificuldade - Nível de dificuldade
 * @returns {Promise<Array>} Array de cards prontos para salvar
 */
export async function generateCards(tema, quantidade, tipo, dificuldade) {
  const diffLabel = { easy: 'fácil', medium: 'médio', hard: 'difícil' }[dificuldade]
  const typeInstructions =
    tipo === 'multiple'
      ? `Cada card deve ter 4 alternativas claras e apenas 1 correta.
"options": array com os textos das alternativas (sem prefixo A/B/C/D).
"correctOption": índice (0–3) da alternativa correta. Varie a posição da correta.`
      : `Cada card é de resposta aberta.
"options": array vazio [].
"correctOption": null.`

  const prompt = `Crie exatamente ${quantidade} flashcard(s) sobre: "${tema}"
Tipo: ${tipo === 'multiple' ? 'múltipla escolha' : 'resposta aberta'}
Dificuldade: ${diffLabel}

${typeInstructions}

Regras:
- "front": pergunta clara e objetiva (máx. 200 caracteres)
- "back": resposta/explicação didática (máx. 400 caracteres)
- "difficulty": sempre "${dificuldade}"
- "type": sempre "${tipo}"
- Para múltipla escolha: alternativas plausíveis e distintas
- Use português brasileiro correto

Retorne SOMENTE o array JSON, sem markdown:
[{"front":"...","back":"...","type":"${tipo}","options":${tipo === 'multiple' ? '["","","",""]' : '[]'},"correctOption":${tipo === 'multiple' ? '0' : 'null'},"difficulty":"${dificuldade}"}]`

  const parsed = await callGroq(prompt)
  const arr = Array.isArray(parsed) ? parsed : [parsed]

  return arr.map((card) => ({
    front: String(card.front || '').trim(),
    back: String(card.back || '').trim(),
    type: card.type === 'multiple' ? 'multiple' : 'open',
    options: Array.isArray(card.options) ? card.options.map(String) : ['', '', '', ''],
    correctOption: card.correctOption != null ? Number(card.correctOption) : 0,
    difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty)
      ? card.difficulty
      : dificuldade,
    _key: Math.random(),
  }))
}

/**
 * Gera uma explicação mais detalhada para o verso de um card.
 * @param {string} frente - Frente do card
 * @param {string} verso - Verso atual do card
 * @returns {Promise<string>} Explicação enriquecida
 */
export async function generateExplanation(frente, verso) {
  const prompt = `Pergunta do flashcard: "${frente}"
Resposta atual: "${verso}"

Escreva uma explicação mais detalhada e didática (máx. 500 caracteres).
Inclua contexto adicional e exemplos práticos quando pertinente.

Retorne SOMENTE: {"explanation":"..."}`

  const result = await callGroq(prompt)
  return result?.explanation || verso
}

/**
 * Sugere novos cards complementares ao baralho existente.
 * @param {string} deckName - Nome do baralho
 * @param {Array} existingCards - Cards já existentes
 * @returns {Promise<Array>} Sugestões de novos cards
 */
export async function suggestRelatedCards(deckName, existingCards) {
  const sample = existingCards
    .slice(0, 5)
    .map((c) => `- "${c.front}"`)
    .join('\n')

  const prompt = `Baralho: "${deckName}"
Cards existentes:
${sample}

Sugira 5 flashcards complementares que cobrem aspectos ainda não abordados.
Varie entre "open" e "multiple", misture dificuldades (easy/medium/hard).

Para "multiple": "options" com 4 alternativas, "correctOption" índice 0–3.
Para "open": "options": [], "correctOption": null.

Retorne SOMENTE o array JSON:
[{"front":"...","back":"...","type":"multiple","options":["","","",""],"correctOption":0,"difficulty":"medium"}]`

  const parsed = await callGroq(prompt)
  const arr = Array.isArray(parsed) ? parsed : [parsed]

  return arr.map((card) => ({
    front: String(card.front || '').trim(),
    back: String(card.back || '').trim(),
    type: card.type === 'multiple' ? 'multiple' : 'open',
    options: Array.isArray(card.options) ? card.options.map(String) : ['', '', '', ''],
    correctOption: card.correctOption != null ? Number(card.correctOption) : 0,
    difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty)
      ? card.difficulty
      : 'medium',
    _key: Math.random(),
  }))
}
