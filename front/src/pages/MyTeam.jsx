import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Users, UserPlus, Trophy, Link as LinkIcon, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import GameStatsForm from '../components/forms/GameStatsForm'
import QRCode from 'qrcode' // gerar QR local
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const POSITION_OPTIONS = [
  { value: 'goleiro', label: 'Goleiro' },
  { value: 'zagueiro', label: 'Zagueiro' },
  { value: 'lateral', label: 'Lateral' },
  { value: 'volante', label: 'Volante' },
  { value: 'meia', label: 'Meia' },
  { value: 'atacante', label: 'Atacante' },
]

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

  const [teams, setTeams] = useState([])              // lista de times do usuário
  const [activeTeam, setActiveTeam] = useState(null)  // time selecionado para ver detalhes/membros
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // convite
  const [invite, setInvite] = useState(null) // { token, url, qrCode?, expiraEm }
  const inviteUrl = invite?.url || ''
  const inviteToken = invite?.token || ''
  const inviteExpires = invite?.expiraEm ? new Date(invite.expiraEm).toLocaleString('pt-BR') : null
  const [inviteLoading, setInviteLoading] = useState(false)

  // loading por membro na troca de posição
  const [positionSaving, setPositionSaving] = useState({}) // { uid: true | false }

  // upload escudo
  const [shieldUploading, setShieldUploading] = useState(false)

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
        if (isRep) {
          await Promise.all([
            loadMembers(id),
            gerarConvite(id),
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
        body: JSON.stringify({ timeId: teamId }),
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

  // atualizar posição do jogador (chama PUT /teams/:id/members/:uid/position)
  const handlePositionChange = async (memberUid, newPosition) => {
    if (!isRep || !activeTeam) return
    const teamId = activeTeam.id || activeTeam._id
    if (!teamId || !memberUid || !newPosition) return

    try {
      setPositionSaving(prev => ({ ...prev, [memberUid]: true }))
      await apiCall(`/teams/${teamId}/members/${memberUid}/position`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPosition }),
      })
      // atualiza localmente o array de members
      setMembers(prev =>
        prev.map(m =>
          m.uid === memberUid ? { ...m, position: newPosition } : m
        )
      )
    } catch (e) {
      console.error('Erro ao atualizar posição do jogador:', e)
      alert('Não foi possível atualizar a posição. Tente novamente.')
    } finally {
      setPositionSaving(prev => ({ ...prev, [memberUid]: false }))
    }
  }

  // upload de escudo (foto) do time - usa PUT /teams/:id/escudo com FormData[memory:87]
  const handleShieldUpload = async (teamId, file) => {
    if (!teamId || !file) return
    try {
      setShieldUploading(true)
      const formData = new FormData()
      formData.append('escudo', file) // mesmo nome usado no multer single("escudo")

      const res = await apiCall(`/teams/${teamId}/escudo`, {
        method: 'PUT',
        body: formData, // não setar Content-Type manualmente aqui
      })

      if (res?.team) {
        const updated = res.team

        // atualiza time ativo
        setActiveTeam(prev =>
          prev && (prev._id === updated._id || prev.id === updated._id) ? updated : prev
        )

        // atualiza lista de times
        setTeams(prev =>
          (prev || []).map(t =>
            (t._id === updated._id || t.id === updated._id) ? updated : t
          )
        )
      }
    } catch (e) {
      console.error('Erro ao enviar escudo:', e)
      alert('Não foi possível enviar o escudo. Tente novamente.')
    } finally {
      setShieldUploading(false)
    }
  }

  const fileInputRef = useRef(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meus Times</h1>
        <Button variant="outline" onClick={loadTeamsAndMaybeFirst}>Atualizar</Button>
      </div>

      {loading ? (
        <div className="text-gray-500 ">Carregando informações...</div>
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
                      {t.logo_url && (
                        <img
                          src={t.logo_url.startsWith('http')
                            ? t.logo_url
                            : `${API_BASE_URL}${t.logo_url}`}
                          alt={`Escudo de ${t.nome || t.name}`}
                          className="w-8 h-8 rounded-full border object-cover"
                        />
                      )}
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
                  <CardTitle className="flex items-center space-x-3">
                    {activeTeam.logo_url ? (
                      <img
                        src={activeTeam.logo_url.startsWith('http')
                          ? activeTeam.logo_url
                          : `${API_BASE_URL}${activeTeam.logo_url}`}
                        alt={`Escudo de ${activeTeam.nome || activeTeam.name}`}
                        className="w-12 h-12 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border flex items-center justify-center text-xs text-gray-500">
                        Sem escudo
                      </div>
                    )}

                    <span>{activeTeam.nome || activeTeam.name}</span>
                  </CardTitle>
                  <CardDescription>{activeTeam.description || 'Sem descrição cadastrada'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Criado em:{' '}
                    {new Date(activeTeam.created_at || activeTeam.createdAt || Date.now())
                      .toLocaleDateString('pt-BR')}
                  </p>

                  {/* Upload de escudo: apenas representante */}
                  {isRep && (
                      <div className="flex flex-col gap-3">
                        <div 
                          className={`group relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-primary hover:bg-primary/5 hover:shadow-md ${
                            shieldUploading ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          onClick={() => !shieldUploading && fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            disabled={shieldUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              const id = activeTeam.id || activeTeam._id
                              if (file && id) {
                                handleShieldUpload(id, file)
                              }
                            }}
                          />
                          
                          <div className="flex flex-col items-center gap-3">
                            {/* Preview ou Placeholder */}
                            {activeTeam.logo_url ? (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                <img 
                                  src={activeTeam.logo_url.startsWith('http') ? activeTeam.logo_url : `${API_BASE_URL}${activeTeam.logo_url}`}
                                  alt="Escudo atual" 
                                  className="w-16 h-16 rounded-full object-cover shadow-md"
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900">
                                {shieldUploading ? 'Enviando escudo...' : 'Clique ou arraste para alterar'}
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG (máx. 2MB) - 60x60px ideal</p>
                            </div>
                          </div>
                          
                          {/* Overlay de loading */}
                          {shieldUploading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                              <div className="flex items-center gap-2 text-sm text-primary">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span>Atualizando...</span>
                              </div>
                            </div>
                          )}
                        </div>                 
                      </div>
                    )}

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
                      <div className="text-sm text-gray-600">
                        {inviteLoading ? 'Gerando convite...' : 'Sem convite ativo'}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input readOnly value={inviteUrl} placeholder="Link de convite" />
                      <Button type="button" onClick={() => copy(inviteUrl)} disabled={!inviteUrl}>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Copiar link
                      </Button>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Input
                        readOnly
                        value={inviteToken}
                        placeholder="Código de convite"
                        className="uppercase tracking-widest"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => copy(inviteToken)}
                        disabled={!inviteToken}
                      >
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
                    members.map((member, idx) => {
                      const uid = member.uid || member.id
                      const saving = positionSaving[uid]
                      const isPlayer = member.user_type === 'jogador'
                      const isSelfRep = isRep && uid === user?.uid
                      const canEditPosition = isRep && (isPlayer || isSelfRep)
                      const currentPos = member.position || 'atacante'

                      return (
                        <div
                          key={uid || idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md gap-4"
                        >
                          <div className="flex flex-col">
                            <p className="font-medium">{member.nome || 'Desconhecido'}</p>

                            {/* Select de posição: só representante vê, para jogadores e para ele mesmo */}
                            {canEditPosition && (
                              <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
                                <span>Posição:</span>
                                <select
                                  className="border rounded px-2 py-1 text-xs bg-white"
                                  value={currentPos}
                                  disabled={saving}
                                  onChange={(e) => handlePositionChange(uid, e.target.value)}
                                >
                                  {POSITION_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Jogador comum só enxerga a posição, não edita */}
                            {!canEditPosition && member.position && (
                              <span className="mt-1 text-xs text-gray-600">
                                Posição{' '}
                                {POSITION_OPTIONS.find(p => p.value === member.position)?.label ||
                                  member.position}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline">{member.user_type || 'Jogador'}</Badge>
                        </div>
                      )
                    })
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
