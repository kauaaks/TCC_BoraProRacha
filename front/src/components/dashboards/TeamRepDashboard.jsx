import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Calendar, CreditCard, Plus, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";

function Qr({ value, size = 220 }) {
  if (!value) return null
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`
  return <img src={src} alt="QR Code" className="rounded border" />
}


export default function TeamRepDashboard({ data, teamId }) {
  const { user, apiCall } = useAuth()
  const navigate = useNavigate();

  const goToStats = () => {
    navigate("/Stats"); // Ou a rota que você definiu para as estatísticas
  };

  const goToMyTeams = () => {
    navigate("/my-team")
  }

  const goToGames = () => {
    navigate("/Games");
  };

  const goToPayments = () => {
    navigate("/Payments");
  };

  // Novo: estados e helpers para criação de time
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    description: '',
    monthly_fee: '',
    firstMonth: '' // YYYY-MM
  })
  const setF = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))
  const isYYYYMM = (s) => /^\d{4}-\d{2}$/.test(String(s || '').trim())
  const ymToDate = (ym) => {
    const m = String(ym || '').trim()
    if (!isYYYYMM(m)) return null
    const [y, mm] = m.split('-').map(Number)
    return new Date(y, (mm - 1), 1, 0, 0, 0, 0)
  }

  const criarTime = async () => {
    const { nome, description, monthly_fee, firstMonth } = form
    if (!nome || !description || !monthly_fee || !firstMonth) {
      alert('Preencha nome, descrição, mensalidade e mês inicial (YYYY-MM).')
      return
    }
    const d = ymToDate(firstMonth)
    if (!d) {
      alert('Mês inválido. Use YYYY-MM.')
      return
    }
    try {
      setCreating(true)
      const body = {
        nome,
        description,
        monthly_fee: Number(monthly_fee),
        next_payment_date: d.toISOString() // ISO 8601 adequado para o backend [web:239][web:238]
      }
      const res = await apiCall('/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res || res.error) {
        alert(res?.error || 'Falha ao criar time')
        return
      }
      setCreateOpen(false)
      setForm({ nome: '', description: '', monthly_fee: '', firstMonth: '' })
      alert('Time criado com sucesso!')
      // Se quiser atualizar cards/contagem, revalide dados da página aqui (ex: refetch pai).
    } catch (e) {
      alert(e?.message || 'Erro ao criar time')
    } finally {
      setCreating(false)
    }
  }

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
        // poderia setar algum estado de perfil, se necessário
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
          BoraProRacha, {firstName}!
        </h1>
        <p className="text-gray-600">
          Representante • {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="outline" onClick={goToMyTeams}>
          <CardHeader>
            <CardTitle>Times</CardTitle>
            <Users />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.teams.length}</div>
          </CardContent>
        </Card>

        <Card variant="outline" onClick={goToGames}>
          <CardHeader>
            <CardTitle>Jogos</CardTitle>
            <Calendar />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.games.length}</div>
          </CardContent>
        </Card>

        <Card variant="outline" onClick={goToPayments}>
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
            {/* Novo Time - agora com Dialog e POST */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">Novo Time</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar novo time</DialogTitle>
                  <DialogDescription>Informe os dados básicos do seu time</DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Nome</label>
                    <Input value={form.nome} onChange={setF('nome')} placeholder="Ex: BoraProRacha, FC" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Descrição</label>
                    <Input value={form.description} onChange={setF('description')} placeholder="Ex: Time de Fut7 Amador" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Mensalidade (R$)</label>
                    <Input type="number" min="0" step="0.01" value={form.monthly_fee} onChange={setF('monthly_fee')} placeholder="Ex: R$50,00" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Primeiro mês (YYYY-MM)</label>
                    <Input value={form.firstMonth} onChange={setF('firstMonth')} placeholder="YYYY-MM" />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                    <Button onClick={criarTime} disabled={creating}>
                      {creating ? 'Criando...' : 'Criar time'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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

            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={goToStats}>
              <Trophy className="w-6 h-6" />
              <span className="text-sm">Ver Estatísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
