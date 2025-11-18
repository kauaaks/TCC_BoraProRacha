import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function JoinTeam() {
  const { user, apiCall } = useAuth()
  const navigate = useNavigate()

  const [input, setInput] = useState('')      // link ou código
  const [token, setToken] = useState('')      // token extraído
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Extrai “token” de um link, ou usa o próprio valor se já for o token
  const extractInviteToken = (raw) => {
    const val = String(raw || '').trim()
    if (!val) return ''
    try {
      const url = new URL(val)
      const qp = new URLSearchParams(url.search)
      const fromQuery = qp.get('token') || qp.get('invite') || qp.get('code') || ''
      if (fromQuery) return fromQuery.trim()
      const segments = url.pathname.split('/').filter(Boolean)
      const fromPath = [...segments].reverse().find(seg => /^[A-Za-z0-9_-]{6,}$/.test(seg))
      if (fromPath) return fromPath.trim()
      if (url.hash) {
        const hash = url.hash.replace(/^#/, '')
        const hashParams = new URLSearchParams(hash.includes('=') ? hash : '')
        const fromHash = hashParams.get('token') || hashParams.get('invite') || hashParams.get('code') || ''
        if (fromHash) return fromHash.trim()
        const hashSeg = hash.split('/').filter(Boolean).reverse()
          .find(seg => /^[A-Za-z0-9_-]{6,}$/.test(seg))
        if (hashSeg) return hashSeg.trim()
      }
      return ''
    } catch {
      // não é URL — assume que já é o token/código de convite
      return val
    }
  }

  useEffect(() => {
    const t = extractInviteToken(input)
    setToken(t.replace(/\s+/g, ''))
  }, [input])

  const helperText = useMemo(() => {
    if (!input) return 'Cole o link de convite ou digite o código.'
    if (input && !token) return 'Não foi possível extrair o token deste link.'
    return ''
  }, [input, token])

  const onPaste = (e) => {
    try {
      const text = e.clipboardData.getData('text')
      if (text) {
        e.preventDefault()
        setInput(text)
      }
    } catch { /* noop */ }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      setMessage({ type: 'error', text: 'Por favor, forneça um link/código válido.' })
      return
    }
    if (!user?.uid) {
      setMessage({ type: 'error', text: 'Sessão inválida. Faça login novamente.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      // verifyFirebaseToken exige o ID token no Authorization
      // Se o seu useAuth/apiCall já injeta o Authorization, ok; senão, passe via headers aqui.
      const res = await apiCall('/invite/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      setMessage({ type: 'success', text: 'Você entrou no time com sucesso!' })
      // setTimeout(() => navigate('/dashboard'), 800)
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Erro ao entrar no time.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Entrar em um Time</h1>
      <p className="mb-4">Cole o link de convite ou digite o código recebido.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Link ou código de convite"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={onPaste}
          className="border p-2 rounded"
          disabled={loading}
          autoComplete="off"
        />

        {input && (
          <div className="text-xs text-gray-600">
            Token detectado: {token || '—'}
          </div>
        )}

        {helperText && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-2 rounded">
            {helperText}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !token}
          className="bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          disabled={loading}
          className="mt-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Voltar
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
