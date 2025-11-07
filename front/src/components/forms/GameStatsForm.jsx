import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function GameStatsForm({ teamId }) {
  const { apiCall } = useAuth()
  const [form, setForm] = useState({
    best_player: '',
    worst_player: '',
    goals: '',
    assists: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const response = await apiCall(`/teams/${teamId}/stats`, {
        method: 'POST',
        body: JSON.stringify(form)
      })

      if (response.error) {
        setMessage('Erro ao enviar estatísticas.')
      } else {
        setMessage('Estatísticas registradas com sucesso!')
        setForm({ best_player: '', worst_player: '', goals: '', assists: '', notes: '' })
      }
    } catch (err) {
      console.error(err)
      setMessage('Erro inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Melhor jogador</Label>
        <Input name="best_player" value={form.best_player} onChange={handleChange} required />
      </div>
      <div>
        <Label>Pior jogador</Label>
        <Input name="worst_player" value={form.worst_player} onChange={handleChange} required />
      </div>
      <div>
        <Label>Total de Gols do Time</Label>
        <Input name="goals" type="number" value={form.goals} onChange={handleChange} />
      </div>
      <div>
        <Label>Assistências</Label>
        <Input name="assists" type="number" value={form.assists} onChange={handleChange} />
      </div>
      <div>
        <Label>Observações</Label>
        <Textarea name="notes" value={form.notes} onChange={handleChange} />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar'}
      </Button>
      {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
    </form>
  )
}
