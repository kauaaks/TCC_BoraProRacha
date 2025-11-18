import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function JoinTeam() {
  const { user, apiCall } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira o código do time.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await apiCall('/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode: code.trim(), userId: user.uid })
      })
      setMessage({ type: 'success', text: 'Você entrou no time com sucesso!' })
      // Opcional: redirecionar para dashboard automaticamente após associação
      // navigate('/dashboard')
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao entrar no time.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Entrar em um Time</h1>
      <p className="mb-4">Coloque abaixo o código ou link de convite recebido do representante do time.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Código ou link do time"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border p-2 rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          disabled={loading}
          className="mt-2 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
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
