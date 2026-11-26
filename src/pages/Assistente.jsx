import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Loader2, AlertCircle, RefreshCw, FileText, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { acordarAssistente, montarDadosDoAluno, perguntarAoAssistente } from '../services/assistenteService'

const SUGESTOES = [
  'Qual trilha eu deveria fazer agora?',
  'Em qual matéria eu estou pior?',
  'Quais cards eu mais erro?',
  'Minha nota no simulado melhorou?',
  'Como funciona o ICE?',
]

const ORIGEM = {
  perfil: 'Seus dados',
  metodologia: 'Guia do app',
  trilhas: 'Trilhas',
}

// Remove as marcações [ID] do texto — as fontes aparecem como chips abaixo da resposta.
const limparCitacoes = (t) => t.replace(/\s*\[[A-Z]{2,3}(?:-\d+)?(?:\s*[,;]\s*[A-Z]{2,3}(?:-\d+)?)*\]/g, '')

function Fontes({ fontes }) {
  if (!fontes?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {fontes.map((f) => (
        <span
          key={f.id}
          title={`${ORIGEM[f.origem] || f.origem} · ${f.titulo}`}
          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400"
        >
          <FileText className="w-3 h-3" />
          {f.titulo}
        </span>
      ))}
    </div>
  )
}

function Balao({ msg }) {
  const doAluno = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${doAluno ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          doAluno ? 'bg-stone-200 dark:bg-stone-800' : 'bg-teal-100 dark:bg-teal-900/30'
        }`}
      >
        {doAluno
          ? <User className="w-4 h-4 text-stone-500" />
          : <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          doAluno
            ? 'bg-teal-600 text-white rounded-tr-sm'
            : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-sm'
        }`}
      >
        {doAluno ? msg.content : limparCitacoes(msg.content)}
        {!doAluno && <Fontes fontes={msg.fontes} />}
      </div>
    </div>
  )
}

export default function Assistente() {
  const { user } = useAuth()
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [mensagens, setMensagens] = useState([])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [erro, setErro] = useState(null)
  const [servidor, setServidor] = useState('ligando') // ligando | pronto | fora
  const fimRef = useRef(null)

  const carregarDados = async () => {
    setCarregando(true)
    setErro(null)
    try {
      setDados(await montarDadosDoAluno(user.uid))
    } catch (e) {
      setErro('Não consegui carregar seus dados de estudo.')
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregarDados() }, [user.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let ativo = true
    acordarAssistente().then((ok) => { if (ativo) setServidor(ok ? 'pronto' : 'fora') })
    return () => { ativo = false }
  }, [])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensagens, pensando])

  const enviar = async (pergunta) => {
    const p = (pergunta ?? texto).trim()
    if (!p || pensando || !dados) return
    const historico = mensagens.map(({ role, content }) => ({ role, content }))
    setMensagens((m) => [...m, { role: 'user', content: p }])
    setTexto('')
    setErro(null)
    setPensando(true)
    try {
      const r = await perguntarAoAssistente({ pergunta: p, dados, historico })
      setMensagens((m) => [...m, { role: 'assistant', content: r.resposta, fontes: r.fontes }])
      setServidor('pronto')
    } catch (e) {
      setErro(e.message)
    } finally {
      setPensando(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Assistente</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Pergunte sobre o seu progresso e o que estudar a seguir
            </p>
          </div>
        </div>
        <button
          onClick={carregarDados}
          disabled={carregando}
          title="Atualizar meus dados"
          className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Conversa */}
      <div className="flex-1 space-y-4 pb-4">
        {mensagens.length === 0 && (
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 p-5">
            <p className="text-sm text-stone-600 dark:text-stone-300 mb-3">
              {carregando
                ? 'Carregando seus baralhos, sessões e simulados…'
                : 'Eu leio seus dados de estudo e o guia do VestibulAnki para responder. Experimente:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  disabled={carregando || pensando}
                  className="text-sm px-3 py-1.5 rounded-full border border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((m, i) => <Balao key={i} msg={m} />)}

        {pensando && (
          <div className="flex items-center gap-2 text-sm text-stone-500 pl-11">
            <Loader2 className="w-4 h-4 animate-spin" />
            {servidor === 'pronto'
              ? 'Analisando seus dados…'
              : 'Ligando o assistente (na primeira pergunta pode levar até 1 minuto)…'}
          </div>
        )}

        {erro && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}
        <div ref={fimRef} />
      </div>

      {/* Campo de pergunta */}
      <form
        onSubmit={(e) => { e.preventDefault(); enviar() }}
        className="sticky bottom-20 md:bottom-4 flex gap-2 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={500}
          placeholder={carregando ? 'Carregando seus dados…' : 'Ex.: em que eu devo focar esta semana?'}
          disabled={carregando}
          className="flex-1 px-3 py-2 bg-transparent text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!texto.trim() || pensando || carregando}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-40"
          aria-label="Enviar pergunta"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      <p className="text-[11px] text-center text-stone-400 mt-2">
        {servidor === 'ligando' && 'Ligando o assistente… '}
        {servidor === 'fora' && 'Servidor do assistente fora do ar no momento. '}
        Respostas geradas por IA a partir dos seus dados. Confira os números no Dashboard.
      </p>
    </div>
  )
}
