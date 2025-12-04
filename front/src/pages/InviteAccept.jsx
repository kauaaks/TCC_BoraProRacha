import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, Users } from 'lucide-react'

export default function InviteAccept() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { apiCall } = useAuth()
  const [status, setStatus] = useState('ready') // ready | joining | success | error
  const [error, setError] = useState('')

  const entrar = async () => {
    try {
      setStatus('joining')
      const res = await apiCall('/invite/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      if (res?.ok) {
        setStatus('success')
        setTimeout(() => navigate('/teams'), 1200)
      } else {
        setStatus('error')
        setError(res?.error || 'Convite inválido ou expirado')
      }
    } catch (e) {
      console.error(e)
      setStatus('error')
      setError('Falha ao entrar no time')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Entrar no time
          </CardTitle>
          <CardDescription>Use o convite para se juntar ao time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'ready' && (
            <>
              <p className="text-sm text-gray-700 break-all">Convite: {token}</p>
              <Button className="w-full" onClick={entrar}>Aceitar e entrar</Button>
            </>
          )}
          {status === 'joining' && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Você entrou no time!
            </div>
          )}
          {status === 'error' && (
            <>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                {error}
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Voltar</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
