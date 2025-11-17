import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Calendar, CreditCard, Plus, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useMemo, useState, useEffect } from 'react'


function Qr({ value, size = 220 }) {
  if (!value) return null
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`
  return <img src={src} alt="QR Code" className="rounded border" />
}

export default function TeamRepDashboard({ data, teamId }) {
  const { user, apiCall } = useAuth()

  
  const effectiveTeamId = useMemo(
    () => teamId || data?.teams?.[0]?.id || data?.teams?.[0]?._id || null,
    [teamId, data]
  )

  
  const fullName = useMemo(
    () => (user?.nome || user?.displayName || user?.name || '').trim(),
    [user]
  )
  const firstName = useMemo(
    () => (fullName ? fullName.split(' ')[0] : ''),
    [fullName]
  )

  
  useEffect(() => {
    const needsRefresh = !user?.nome && (user?.displayName || user?.uid)
    if (!needsRefresh) return
    let ignore = false
    ;(async () => {
      try {
        const me = await apiCall('/users/me?t=' + Date.now()).catch(() => null)
      } catch {}
      if (!ignore) {
        
      }
    })()
    return () => { ignore = true }
  }, [user?.nome, user?.displayName, user?.uid, apiCall])

  const [invite, setInvite] = useState(null)
  const [open, setOpen] = useState(false)
  const inviteUrl = invite?.url || ''
  const inviteToken = invite?.token || ''
  const inviteExpires = invite?.expiraEm ? new Date(invite.expiraEm).toLocaleString('pt-BR') : null

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copiado!')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      alert('Copiado!')
    }
  }

  const gerarConvite = async () => {
    if (!effectiveTeamId) {
      alert('Selecione um time primeiro.')
      return
    }
    try {
      const res = await apiCall('/invite/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeId: effectiveTeamId })
      })
      if (res?.invite) setInvite(res.invite)
      else alert(res?.error || 'Falha ao gerar convite')
    } catch (e) {
      console.error(e)
      alert('Erro ao gerar convite')
    }
  }

  
  useEffect(() => {
    if (open) gerarConvite()
  }, [open])

  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Bora pro Racha, {firstName}!
        </h1>
        <p className="text-gray-600">
          Representante • {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Times</CardTitle>
            <Users />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.teams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jogos</CardTitle>
            <Calendar />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.games.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagamentos</CardTitle>
            <CreditCard />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie seu time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="w-6 h-6" />
              <span className="text-sm">Novo Time</span>
            </Button>

            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Agendar Jogo</span>
            </Button>

            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Adicionar Membro</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Convidar novo membro</DialogTitle>
                  <DialogDescription>Compartilhe o convite para o jogador entrar no time</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  
                  {inviteUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <Qr value={inviteUrl} />
                      <div className="text-xs text-gray-500 break-all text-center">{inviteUrl}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">Gerando convite...</div>
                  )}

                  
                  <div className="flex gap-2">
                    <Input readOnly value={inviteUrl} placeholder="Link de convite" />
                    <Button
                      type="button"
                      onClick={() => inviteUrl && copy(inviteUrl)}
                      disabled={!inviteUrl}
                    >
                      Copiar link
                    </Button>
                  </div>

                  
                  <div className="flex gap-2 items-center">
                    <Input readOnly value={inviteToken} placeholder="Código de convite" className="uppercase tracking-widest" />
                    <Button
                      type="button"
                      onClick={() => inviteToken && copy(inviteToken)}
                      disabled={!inviteToken}
                      variant="outline"
                    >
                      Copiar código
                    </Button>
                  </div>

                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {inviteExpires ? `Expira em ${inviteExpires}` : 'Convite sem expiração'}
                    </span>
                    <div className="flex gap-2">
                      <Button onClick={gerarConvite} className="bg-appsociety-green hover:bg-green-600">
                        Renovar convite
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Trophy className="w-6 h-6" />
              <span className="text-sm">Ver Estatísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
