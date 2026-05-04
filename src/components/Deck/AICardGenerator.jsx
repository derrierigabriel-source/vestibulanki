import { useState } from 'react'
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react'

const CARD_TYPES = [
  { value: 'multiple', label: 'Múltipla escolha', sub: 'Com 4 alternativas' },
  { value: 'open', label: 'Resposta aberta', sub: 'Dissertativa' },
  { value: 'mixed', label: 'Misto', sub: 'Múltipla + Aberta' },
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' },
]

const DIFF_COLORS = {
  easy: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
  medium: 'border-amber-500 text-amber-600 dark:text-amber-400',
  hard: 'border-red-500 text-red-600 dark:text-red-400',
}

const MIN = 1
const MAX = 10

async function callClaudeAPI(topic, count, type, difficulty) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY não configurada no .env')

  const typeInstruction =
    type === 'multiple'
      ? 'Gere APENAS questões de múltipla escolha (type: "multiple") com 4 alternativas.'
      : type === 'open'
      ? 'Gere APENAS questões abertas/dissertativas (type: "open").'
      : `Gere uma mistura: metade múltipla escolha (type: "multiple") e metade aberta (type: "open"). Alterne os tipos.`

  const diffLabel =
    difficulty === 'easy' ? 'fácil/iniciante' : difficulty === 'medium' ? 'médio/intermediário' : 'difícil/avançado'

  const prompt = `Você é um professor criando flashcards de estudo em português do Brasil.

Tema: "${topic}"
Quantidade: ${count} cards
Nível: ${diffLabel}
${typeInstruction}

Retorne APENAS um array JSON válido, sem markdown, sem explicação. Cada objeto deve ter:
- front: string (a pergunta ou conceito)
- back: string (a resposta ou explicação detalhada)
- difficulty: "${difficulty}"
- type: "multiple" ou "open"
- options: array de 4 strings se múltipla escolha, array vazio se aberta
- correctOption: número 0-3 (índice da alternativa correta) se múltipla, null se aberta

Exemplo mínimo:
[{"front":"Qual é...?","back":"A resposta é...","difficulty":"${difficulty}","type":"multiple","options":["A","B","C","D"],"correctOption":1}]

Gere exatamente ${count} cards sobre "${topic}".`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Erro ${res.status} na API`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || ''

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Resposta da IA não contém JSON válido')

  const cards = JSON.parse(jsonMatch[0])
  if (!Array.isArray(cards)) throw new Error('Formato de resposta inesperado')
  return cards
}

export default function AICardGenerator({ deckName, onGenerated, onClose }) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [type, setType] = useState('multiple')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Correct thumb position: (value - min) / (max - min) * 100%
  const sliderPercent = ((count - MIN) / (MAX - MIN)) * 100

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const cards = await callClaudeAPI(topic.trim(), count, type, difficulty)
      onGenerated(cards)
    } catch (e) {
      setError(e.message || 'Erro ao gerar cards. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white leading-tight">
                Gerar cards com IA
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500">Configure a geração</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Tema ou assunto
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Derivadas, Revolução Francesa, Funções trigonométricas..."
              className="w-full px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          {/* Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Quantidade de cards
              </label>
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                {count}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={MIN}
                max={MAX}
                step={1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #7c3aed ${sliderPercent}%, #e7e5e4 ${sliderPercent}%)`,
                  accentColor: '#7c3aed',
                }}
              />
              {/* Tick labels — positioned proportionally to match thumb travel */}
              <div className="relative h-5 mt-1">
                <span className="absolute left-0 text-xs text-stone-400 dark:text-stone-500">
                  {MIN}
                </span>
                {/* 5 is at (5-1)/(10-1) = 44.44% */}
                <span
                  className="absolute text-xs text-stone-400 dark:text-stone-500 -translate-x-1/2"
                  style={{ left: '44.44%' }}
                >
                  5
                </span>
                <span className="absolute right-0 text-xs text-stone-400 dark:text-stone-500">
                  {MAX}
                </span>
              </div>
            </div>
          </div>

          {/* Card type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Tipo de card
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CARD_TYPES.map(({ value, label, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`px-3 py-3 rounded-xl border-2 text-left transition-all ${
                    type === value
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  <p className={`text-xs font-semibold leading-tight ${type === value ? 'text-violet-700 dark:text-violet-300' : 'text-stone-700 dark:text-stone-300'}`}>
                    {label}
                  </p>
                  <p className={`text-xs mt-0.5 ${type === value ? 'text-violet-500 dark:text-violet-400' : 'text-stone-400'}`}>
                    {sub}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Dificuldade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty(value)}
                  className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    difficulty === value
                      ? `${DIFF_COLORS[value]} bg-opacity-10`
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                  style={
                    difficulty === value
                      ? { borderColor: undefined }
                      : {}
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar {count} {count === 1 ? 'card' : 'cards'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
