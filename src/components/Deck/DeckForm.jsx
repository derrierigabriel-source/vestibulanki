import { useState } from 'react'
import {
  X, Plus, Trash2, ChevronDown, ChevronUp,
  Sparkles, Loader2, CheckCircle, AlertCircle, RefreshCw,
} from 'lucide-react'
import { generateCards } from '../../services/geminiService'

const COLORS = [
  '#3B82F6', '#F97316', '#8B5CF6', '#0D9488', '#EF4444',
  '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#84CC16',
]

const CATEGORIES = ['Exatas', 'Humanas', 'Ciências', 'Raciocínio', 'Idiomas', 'Outros']

const emptyCard = () => ({
  front: '',
  back: '',
  difficulty: 'medium',
  type: 'open',
  options: ['', '', '', ''],
  correctOption: 0,
  _key: Math.random(),
})

// ─── AI Modal ────────────────────────────────────────────────────────────────

const DIFF_LABELS = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }
const LETTER = ['A', 'B', 'C', 'D']

function AIModal({ deckName, onConfirm, onClose }) {
  const [step, setStep] = useState('form') // 'form' | 'preview'
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [preview, setPreview] = useState([])
  const [expandedPreview, setExpandedPreview] = useState(null)

  // Form state
  const [tema, setTema] = useState(deckName || '')
  const [quantidade, setQuantidade] = useState(5)
  const [tipo, setTipo] = useState('multiple')
  const [dificuldade, setDificuldade] = useState('medium')

  const handleGenerate = async () => {
    if (!tema.trim()) { setAiError('Informe o tema.'); return }
    setAiError('')
    setAiLoading(true)
    try {
      const cards = await generateCards(tema.trim(), quantidade, tipo, dificuldade)
      setPreview(cards)
      setExpandedPreview(0)
      setStep('preview')
    } catch (e) {
      setAiError(e.message || 'Erro ao gerar cards. Verifique sua chave da API.')
    } finally {
      setAiLoading(false)
    }
  }

  const updatePreviewCard = (idx, field, value) => {
    setPreview((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const updatePreviewOption = (cardIdx, optIdx, value) => {
    setPreview((prev) => {
      const next = [...prev]
      const opts = [...(next[cardIdx].options || ['', '', '', ''])]
      opts[optIdx] = value
      next[cardIdx] = { ...next[cardIdx], options: opts }
      return next
    })
  }

  const removePreviewCard = (idx) => {
    setPreview((prev) => prev.filter((_, i) => i !== idx))
    if (expandedPreview >= idx) setExpandedPreview(Math.max(0, expandedPreview - 1))
  }

  const handleConfirm = () => {
    const valid = preview.filter((c) => c.front.trim() && c.back.trim())
    if (valid.length === 0) return
    onConfirm(valid)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Gerar cards com IA
              </h3>
              <p className="text-xs text-stone-400">
                {step === 'form' ? 'Configure a geração' : `${preview.length} cards gerados — revise antes de confirmar`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP: form ── */}
          {step === 'form' && (
            <div className="space-y-5">
              {/* Tema */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Tema ou assunto
                </label>
                <input
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Derivadas, Revolução Francesa, Funções trigonométricas..."
                  className="w-full px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Quantidade de cards: <span className="text-violet-600 font-bold">{quantidade}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>1</span><span>5</span><span>10</span>
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Tipo de card
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'multiple', label: 'Múltipla escolha', desc: 'Com 4 alternativas' },
                    { value: 'open', label: 'Resposta aberta', desc: 'Dissertativa' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTipo(opt.value)}
                      className={`flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all ${
                        tipo === opt.value
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${tipo === opt.value ? 'text-violet-700 dark:text-violet-300' : 'text-stone-700 dark:text-stone-300'}`}>
                        {opt.label}
                      </span>
                      <span className="text-xs text-stone-400 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dificuldade */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Dificuldade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'easy', label: 'Fácil', color: 'emerald' },
                    { value: 'medium', label: 'Médio', color: 'amber' },
                    { value: 'hard', label: 'Difícil', color: 'red' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDificuldade(opt.value)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        dificuldade === opt.value
                          ? opt.value === 'easy'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                            : opt.value === 'medium'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-stone-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {aiError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>
                </div>
              )}

              {!import.meta.env.VITE_GROQ_API_KEY && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>VITE_GROQ_API_KEY</strong> não configurada no <code>.env</code>.
                    Obtenha gratuitamente em{' '}
                    <span className="underline">console.groq.com</span>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: preview ── */}
          {step === 'preview' && (
            <div className="space-y-2">
              {preview.length === 0 && (
                <p className="text-center text-stone-400 py-8">Nenhum card válido gerado.</p>
              )}
              {preview.map((card, idx) => (
                <div
                  key={card._key ?? idx}
                  className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden"
                >
                  {/* Card header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors"
                    onClick={() => setExpandedPreview(expandedPreview === idx ? -1 : idx)}
                  >
                    {/* badges */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      card.type === 'multiple'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                    }`}>
                      {card.type === 'multiple' ? 'MC' : 'Aberta'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      card.difficulty === 'easy'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        : card.difficulty === 'hard'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                    }`}>
                      {DIFF_LABELS[card.difficulty]}
                    </span>
                    <span className="flex-1 text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
                      {card.front || `Card ${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePreviewCard(idx) }}
                        className="p-1 rounded text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedPreview === idx
                        ? <ChevronUp className="w-4 h-4 text-stone-400" />
                        : <ChevronDown className="w-4 h-4 text-stone-400" />
                      }
                    </div>
                  </div>

                  {/* Card edit body */}
                  {expandedPreview === idx && (
                    <div className="px-4 py-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-stone-500 mb-1 block">Tipo</label>
                          <select
                            value={card.type}
                            onChange={(e) => updatePreviewCard(idx, 'type', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                          >
                            <option value="open">Aberta</option>
                            <option value="multiple">Múltipla escolha</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-stone-500 mb-1 block">Dificuldade</label>
                          <select
                            value={card.difficulty}
                            onChange={(e) => updatePreviewCard(idx, 'difficulty', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                          >
                            <option value="easy">Fácil</option>
                            <option value="medium">Médio</option>
                            <option value="hard">Difícil</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-stone-500 mb-1 block">Frente (pergunta)</label>
                        <textarea
                          value={card.front}
                          onChange={(e) => updatePreviewCard(idx, 'front', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-stone-500 mb-1 block">Verso (resposta)</label>
                        <textarea
                          value={card.back}
                          onChange={(e) => updatePreviewCard(idx, 'back', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        />
                      </div>

                      {card.type === 'multiple' && (
                        <div>
                          <label className="text-xs text-stone-500 mb-1 block">
                            Alternativas (marque a correta)
                          </label>
                          {(card.options || ['', '', '', '']).map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2 mb-2">
                              <input
                                type="radio"
                                name={`preview-correct-${idx}`}
                                checked={card.correctOption === oi}
                                onChange={() => updatePreviewCard(idx, 'correctOption', oi)}
                                className="accent-violet-600"
                              />
                              <span className="text-xs font-bold text-stone-400 w-4">{LETTER[oi]})</span>
                              <input
                                value={opt}
                                onChange={(e) => updatePreviewOption(idx, oi, e.target.value)}
                                className="flex-1 px-3 py-1.5 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex gap-3">
          {step === 'form' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={aiLoading || !tema.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-500/20"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando {quantidade} cards...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar {quantidade} card{quantidade > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regerar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={preview.filter((c) => c.front.trim()).length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Adicionar {preview.filter((c) => c.front.trim()).length} cards ao baralho
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main DeckForm ────────────────────────────────────────────────────────────

export default function DeckForm({ deck, existingCards = [], onSubmit, onClose }) {
  const [name, setName] = useState(deck?.name || '')
  const [color, setColor] = useState(deck?.color || COLORS[0])
  const [category, setCategory] = useState(deck?.category || 'Exatas')
  const [cards, setCards] = useState(
    existingCards.length
      ? existingCards.map((c) => ({ ...c, _key: Math.random() }))
      : [emptyCard()]
  )
  const [expandedIdx, setExpandedIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const isEdit = !!deck

  const updateCard = (idx, field, value) => {
    setCards((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const updateOption = (cardIdx, optIdx, value) => {
    setCards((prev) => {
      const next = [...prev]
      const opts = [...(next[cardIdx].options || ['', '', '', ''])]
      opts[optIdx] = value
      next[cardIdx] = { ...next[cardIdx], options: opts }
      return next
    })
  }

  const addCard = () => {
    setCards((prev) => [...prev, emptyCard()])
    setExpandedIdx(cards.length)
  }

  const removeCard = (idx) => {
    setCards((prev) => prev.filter((_, i) => i !== idx))
    if (expandedIdx >= idx) setExpandedIdx(Math.max(0, expandedIdx - 1))
  }

  const handleAIConfirm = (generatedCards) => {
    setCards((prev) => {
      // Remove the initial empty card if it's still blank
      const filtered =
        prev.length === 1 && !prev[0].front.trim() && !prev[0].back.trim()
          ? []
          : prev
      return [...filtered, ...generatedCards]
    })
    setExpandedIdx(-1)
    setShowAI(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSubmit(
      { name: name.trim(), color, category },
      cards.filter((c) => c.front.trim() && c.back.trim())
    )
    setLoading(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              {isEdit ? 'Editar baralho' : 'Novo baralho'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Nome do baralho
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Matemática Básica"
                  required
                  className="w-full px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Cor
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        backgroundColor: c,
                        outline: color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Cards header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    Cards ({cards.length})
                  </label>
                  <div className="flex items-center gap-3">
                    {/* AI button */}
                    <button
                      type="button"
                      onClick={() => setShowAI(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-teal-600 text-white hover:from-violet-700 hover:to-teal-700 transition-all shadow-sm shadow-violet-500/30"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Gerar com IA
                    </button>
                    <button
                      type="button"
                      onClick={addCard}
                      className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar card
                    </button>
                  </div>
                </div>

                {/* Cards list */}
                <div className="space-y-2">
                  {cards.map((card, idx) => (
                    <div
                      key={card._key ?? idx}
                      className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden"
                    >
                      {/* Card header */}
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors"
                        onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                      >
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate mr-2">
                          Card {idx + 1}
                          {card.front
                            ? ` — ${card.front.slice(0, 40)}${card.front.length > 40 ? '…' : ''}`
                            : ''}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeCard(idx) }}
                            className="p-1 rounded text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {expandedIdx === idx
                            ? <ChevronUp className="w-4 h-4 text-stone-400" />
                            : <ChevronDown className="w-4 h-4 text-stone-400" />
                          }
                        </div>
                      </div>

                      {/* Card body */}
                      {expandedIdx === idx && (
                        <div className="px-4 py-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-stone-500 mb-1 block">Tipo</label>
                              <select
                                value={card.type}
                                onChange={(e) => updateCard(idx, 'type', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              >
                                <option value="open">Aberta</option>
                                <option value="multiple">Múltipla escolha</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-stone-500 mb-1 block">Dificuldade</label>
                              <select
                                value={card.difficulty}
                                onChange={(e) => updateCard(idx, 'difficulty', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              >
                                <option value="easy">Fácil</option>
                                <option value="medium">Médio</option>
                                <option value="hard">Difícil</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">
                              Frente (pergunta)
                            </label>
                            <textarea
                              value={card.front}
                              onChange={(e) => updateCard(idx, 'front', e.target.value)}
                              rows={2}
                              placeholder="Digite a pergunta..."
                              className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">
                              Verso (resposta)
                            </label>
                            <textarea
                              value={card.back}
                              onChange={(e) => updateCard(idx, 'back', e.target.value)}
                              rows={2}
                              placeholder="Digite a resposta..."
                              className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            />
                          </div>

                          {card.type === 'multiple' && (
                            <div>
                              <label className="text-xs text-stone-500 mb-1 block">
                                Alternativas (marque a correta)
                              </label>
                              {(card.options || ['', '', '', '']).map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2 mb-2">
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={card.correctOption === oi}
                                    onChange={() => updateCard(idx, 'correctOption', oi)}
                                    className="accent-teal-600"
                                  />
                                  <input
                                    value={opt}
                                    onChange={(e) => updateOption(idx, oi, e.target.value)}
                                    placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                                    className="flex-1 px-3 py-1.5 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar baralho'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI Modal rendered outside main modal to avoid z-index issues */}
      {showAI && (
        <AIModal
          deckName={name}
          onConfirm={handleAIConfirm}
          onClose={() => setShowAI(false)}
        />
      )}
    </>
  )
}
