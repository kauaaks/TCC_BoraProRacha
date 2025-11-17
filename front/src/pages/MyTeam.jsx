import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Users, UserPlus, Trophy, Link as LinkIcon, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import GameStatsForm from '../components/forms/GameStatsForm'
import QRCode from 'qrcode' // gerar QR local

function QrLocal({ value, size = 220 }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let alive = true
    if (!value) { setSrc(''); return }
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then(url => { if (alive) setSrc(url) })
      .catch(() => { if (alive) setSrc('') })
    return () => { alive = false }
  }, [value, size])
  if (!src) return null
  return <img src={src} alt="QR Code" className="rounded border" />
}

export default function MyTeam() {
  const { user, apiCall } = useAuth()
  const role = user?.user_type
  const isRep = role === 'representante_time'
  const isJog = role === 'jogador'

  const [teams, setTeams] = useState([])        // lista de times do usuário
  const [activeTeam, setActiveTeam] = useState(null) // time selecionado para ver detalhes/membros
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // convite
  const [invite, setInvite] = useState(null) // { token, url, qrCode?, expiraEm }
  const inviteUrl = invite?.url || ''
  const inviteToken = invite?.token || ''
  const inviteExpires = invite?.expiraEm ? new Date(invite.expiraEm).toLocaleString('pt-BR') : null
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    loadTeamsAndMaybeFirst()
  }, [])

  const loadTeamsAndMaybeFirst = async () => {
    try {
      setLoading(true)
      const teamRes = await apiCall('/teams/meustimes')
      const list = teamRes?.teams || []
      setTeams(Array.isArray(list) ? list : [])

      if (Array.isArray(list) && list.length > 0) {
        const first = list[0]
        setActiveTeam(first)
        const id = first.id || first._id
        // Jogador não precisa de convite
        if (isRep) {
          await Promise.all([
            loadMembers(id),
            gerarConvite(id)
          ])
        } else {
          await loadMembers(id)
          setInvite(null)
        }
      } else {
        setActiveTeam(null)
        setMembers([])
        setInvite(null)
      }
    } catch (error) {
      console.error('Erro ao carregar times do usuário:', error)
      setTeams([])
      setActiveTeam(null)
      setMembers([])
      setInvite(null)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async (teamId) => {
    try {
      if (!teamId) return
      const membersRes = await apiCall(`/teams/${teamId}/members`)
      setMembers(membersRes?.members || [])
    } catch (e) {
      console.error('Erro ao carregar membros:', e)
      setMembers([])
    }
  }

  const gerarConvite = async (teamId) => {
    if (!isRep) return // só representantes geram convite
    if (!teamId || inviteLoading) return
    try {
      setInviteLoading(true)
      const res = await apiCall('/invite/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeId: teamId })
      })
      if (res?.invite) {
        setInvite(res.invite)
      } else {
        setInvite(null)
        if (res?.error) console.warn(res.error)
      }
    } catch (e) {
      console.error('Erro ao gerar convite:', e)
      setInvite(null)
    } finally {
      setInviteLoading(false)
    }
  }

  const copy = async (text) => {
    try {
      if (!text) return
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meus Times</h1>
        <Button variant="outline" onClick={loadTeamsAndMaybeFirst}>Atualizar</Button>
      </div>

      {loading ? (
        <div className="text-gray-500">Carregando informações...</div>
      ) : teams.length === 0 ? (
        <div className="text-red-500">Nenhum time vinculado a este usuário.</div>
      ) : (
        <>
          {/* Lista de times do usuário */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => {
              const id = t.id || t._id
              const isActive = activeTeam?.id === id || activeTeam?._id === id
              return (
                <Card
                  key={id}
                  className={`cursor-pointer ${isActive ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={async () => {
                    setActiveTeam(t)
                    await loadMembers(id)
                    if (isRep) await gerarConvite(id)
                    else setInvite(null)
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>{t.nome || t.name}</span>
                    </CardTitle>
                    <CardDescription>{t.description || 'Sem descrição cadastrada'}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <p>
                      Mensalidade{' '}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                        .format(Number(t.monthly_fee || 0))}
                    </p>
                    <p>Membros: {t.member_count ?? (Array.isArray(t.members) ? t.members.length : 0)}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Detalhes do time selecionado */}
          {activeTeam && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>{activeTeam.nome || activeTeam.name}</span>
                  </CardTitle>
                  <CardDescription>{activeTeam.description || 'Sem descrição cadastrada'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Criado em: {new Date(activeTeam.created_at || activeTeam.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>

              {/* Convidar membros: apenas representante */}
              {isRep ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <UserPlus className="w-5 h-5" />
                        <span>Convidar membros</span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => gerarConvite(activeTeam.id || activeTeam._id)}
                        disabled={inviteLoading}
                        className="flex items-center gap-2"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        {inviteLoading ? 'Gerando...' : 'Renovar convite'}
                      </Button>
                    </CardTitle>
                    <CardDescription>Compartilhe o convite para o jogador entrar no time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inviteUrl ? (
                      <div className="flex flex-col items-center gap-3" key={inviteToken}>
                        {invite?.qrCode
                          ? <img src={invite.qrCode} alt="QR Code" className="rounded border" />
                          : <QrLocal value={inviteUrl} />
                        }
                        <div className="text-xs text-gray-500 break-all text-center">{inviteUrl}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">{inviteLoading ? 'Gerando convite...' : 'Sem convite ativo'}</div>
                    )}

                    <div className="flex gap-2">
                      <Input readOnly value={inviteUrl} placeholder="Link de convite" />
                      <Button type="button" onClick={() => copy(inviteUrl)} disabled={!inviteUrl}>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Copiar link
                      </Button>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Input readOnly value={inviteToken} placeholder="Código de convite" className="uppercase tracking-widest" />
                      <Button type="button" variant="outline" onClick={() => copy(inviteToken)} disabled={!inviteToken}>
                        Copiar código
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500">
                      {inviteExpires ? `Expira em ${inviteExpires}` : 'Convite sem expiração'}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Aviso para jogador
                <Card>
                  <CardHeader>
                    <CardTitle>Convites</CardTitle>
                    <CardDescription>Disponível apenas para representantes do time</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    Peça ao seu representante para enviar o link ou código de convite quando necessário.
                  </CardContent>
                </Card>
              )}

              {/* Membros */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Membros ({members.length})</span>
                  </CardTitle>
                  <CardDescription>Lista de jogadores cadastrados no time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {members.length > 0 ? (
                    members.map((member, idx) => (
                      <div key={member.uid || member.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">{member.nome || 'Desconhecido'}</p>
                        </div>
                        <Badge variant="outline">{member.user_type || 'Jogador'}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum membro cadastrado</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
