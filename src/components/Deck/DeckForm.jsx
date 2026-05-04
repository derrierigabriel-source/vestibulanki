import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

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

export default function DeckForm({ deck, existingCards = [], onSubmit, onClose }) {
  const [name, setName] = useState(deck?.name || '')
  const [color, setColor] = useState(deck?.color || COLORS[0])
  const [category, setCategory] = useState(deck?.category || 'Exatas')
  const [cards, setCards] = useState(existingCards.length ? existingCards.map(c => ({ ...c, _key: Math.random() })) : [emptyCard()])
  const [expandedIdx, setExpandedIdx] = useState(0)
  const [loading, setLoading] = useState(false)
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
    const newCard = emptyCard()
    setCards((prev) => [...prev, newCard])
    setExpandedIdx(cards.length)
  }

  const removeCard = (idx) => {
    setCards((prev) => prev.filter((_, i) => i !== idx))
    if (expandedIdx >= idx) setExpandedIdx(Math.max(0, expandedIdx - 1))
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">
            {isEdit ? 'Editar baralho' : 'Novo baralho'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
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
                      ring: color === c ? `3px solid ${c}` : 'none',
                      outline: color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Cards ({cards.length})
                </label>
                <button
                  type="button"
                  onClick={addCard}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar card
                </button>
              </div>

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
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        Card {idx + 1}{card.front ? ` — ${card.front.slice(0, 40)}${card.front.length > 40 ? '…' : ''}` : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeCard(idx) }}
                          className="p-1 rounded text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {expandedIdx === idx ? (
                          <ChevronUp className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
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
                          <label className="text-xs text-stone-500 mb-1 block">Frente (pergunta)</label>
                          <textarea
                            value={card.front}
                            onChange={(e) => updateCard(idx, 'front', e.target.value)}
                            rows={2}
                            placeholder="Digite a pergunta..."
                            className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-stone-500 mb-1 block">Verso (resposta)</label>
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
  )
}
