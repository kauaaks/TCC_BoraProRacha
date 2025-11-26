import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const badgeColors = {
  pendente: 'bg-yellow-100 text-yellow-800',
  aceito: 'bg-blue-100 text-blue-800',
  cancelado: 'bg-red-100 text-red-800',
  terminado: 'bg-green-100 text-green-800',
}

const STATUS_LABELS = {
  pendente: 'Pendente',
  aceito: 'Agendado',
  cancelado: 'Cancelado',
  terminado: 'Finalizado',
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}
function formatHour(dateStr) {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// helper pra pegar o _id correto do time (populado ou não)
function getTeamIdFromGame(game, index) {
  const t = (game.teams_id || [])[index]
  return t?._id || t?.id || t || null
}

export default function Games() {
  const { user } = useAuth()
  const role = user?.user_type
  const isRep = role === 'representante_time'
  const isJog = role === 'jogador'

  const [teams, setTeams] = useState([])
  const [teamId, setTeamId] = useState('')
  const [tab, setTab] = useState('pendente')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [error, setError] = useState('')

  const [opponentTeams, setOpponentTeams] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    opponentTeamId: '',
    fieldId: '',
    date: '',
    time: '',
    duration: '60',
  })

  // Modal de estatísticas
  const [statsModal, setStatsModal] = useState({
    open: false,
    game: null,
    loading: false,
    playersStats: [],
    members: [],
  })

  const [myStatsForm, setMyStatsForm] = useState({ goals: 0, assists: 0 })
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [repStatsForm, setRepStatsForm] = useState({ goals: 0, assists: 0 })

  // Modal de resultado do jogo (gols + vencedor/empate)
  const [resultModal, setResultModal] = useState({
    open: false,
    saving: false,
    game: null,
    team1Goals: '',
    team2Goals: '',
    winner: null, // 'team1' | 'draw' | 'team2'
  })

  // -------- TIMES --------

  async function fetchTeams() {
    setLoadingTeams(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/teams/meustimes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        const list = Array.isArray(data.teams) ? data.teams : data
        setTeams(list)
        if (list.length) {
          const firstId = String(list[0].id || list[0]._id)
          setTeamId(firstId)
        }
        await fetchOpponentTeams(list)
      } else {
        setTeams([])
        setError(data?.error || 'Erro ao buscar times')
      }
    } catch (e) {
      setTeams([])
      setError('Erro de conexão')
    } finally {
      setLoadingTeams(false)
    }
  }

  async function fetchOpponentTeams(myTeamsList) {
    try {
      const res = await fetch(`${API_BASE_URL}/teams`)
      const data = await res.json()
      if (!res.ok) return
      const all = Array.isArray(data) ? data : data.teams
      const myIds = new Set(myTeamsList.map((t) => String(t.id || t._id)))
      const others = (all || []).filter((t) => !myIds.has(String(t.id || t._id)))
      setOpponentTeams(others)
    } catch {
      setOpponentTeams([])
    }
  }

  // -------- JOGOS --------

  async function fetchGamesByStatus(status, tId) {
    if (!tId) {
      setGames([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${API_BASE_URL}/games/status?status=${status}&teamId=${encodeURIComponent(
          tId,
        )}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const data = await res.json()
      if (res.ok) {
        setGames(data)
      } else {
        setGames([])
        setError(data?.error || 'Erro ao buscar jogos')
      }
    } catch (e) {
      setGames([])
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateGame(e) {
    e.preventDefault()
    if (!teamId) return
    if (!form.opponentTeamId || !form.fieldId || !form.date || !form.time) {
      setError('Preencha todos os campos para agendar o jogo')
      return
    }
    setCreating(true)
    setError('')
    try {
      const [year, month, day] = form.date.split('-').map(Number)
      const [hour, minute] = form.time.split(':').map(Number)
      const scheduled = new Date(year, month - 1, day, hour, minute)

      const token = localStorage.getItem('token')
      const body = {
        teams_id: [teamId, form.opponentTeamId],
        field_id: form.fieldId,
        scheduled_date: scheduled.toISOString(),
        duration: form.duration || '60',
      }

      const res = await fetch(`${API_BASE_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao criar jogo')

      setCreateOpen(false)
      setForm({ opponentTeamId: '', fieldId: '', date: '', time: '', duration: '60' })
      await fetchGamesByStatus(tab, teamId)
    } catch (e) {
      setError(e.message || 'Erro ao criar jogo')
    } finally {
      setCreating(false)
    }
  }

  async function handleAccept(gameId) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/games/${gameId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao aceitar convite')
      await fetchGamesByStatus(tab, teamId)
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleCancel(gameId) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/games/${gameId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao cancelar jogo')
      await fetchGamesByStatus(tab, teamId)
    } catch (e) {
      alert(e.message)
    }
  }

  // abrir modal para definir resultado antes de finalizar
  function handleFinish(game) {
    if (!game) return
    const team1Goals = game.goals_team1 ?? ''
    const team2Goals = game.goals_team2 ?? ''

    let winner = null
    if (game.winner_team_id) {
      const t1Id = getTeamIdFromGame(game, 0)
      const t2Id = getTeamIdFromGame(game, 1)
      if (t1Id && String(game.winner_team_id) === String(t1Id)) winner = 'team1'
      else if (t2Id && String(game.winner_team_id) === String(t2Id)) winner = 'team2'
    }

    setResultModal({
      open: true,
      saving: false,
      game,
      team1Goals: team1Goals === 0 ? '0' : String(team1Goals || ''),
      team2Goals: team2Goals === 0 ? '0' : String(team2Goals || ''),
      winner,
    })
  }

  function closeResultModal() {
    setResultModal({
      open: false,
      saving: false,
      game: null,
      team1Goals: '',
      team2Goals: '',
      winner: null,
    })
  }

  // envia resultado (PUT /games/:id/result) e depois finaliza (POST /finish)
  async function confirmFinish() {
    const { game, team1Goals, team2Goals, winner } = resultModal
    if (!game) return

    const g1 = Number(team1Goals)
    const g2 = Number(team2Goals)

    if (Number.isNaN(g1) || Number.isNaN(g2)) {
      alert('Informe gols válidos para os dois times.')
      return
    }
    if (winner === null) {
      alert('Selecione quem venceu ou empate.')
      return
    }

    let winner_team_id = null
    if (winner === 'team1') {
      winner_team_id = getTeamIdFromGame(game, 0)
    } else if (winner === 'team2') {
      winner_team_id = getTeamIdFromGame(game, 1)
    }
    // winner === 'draw' => winner_team_id fica null (empate)

    try {
      setResultModal((s) => ({ ...s, saving: true }))
      const token = localStorage.getItem('token')

      // 1) definir resultado
      let res = await fetch(`${API_BASE_URL}/games/${game._id}/result`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goals_team1: g1,
          goals_team2: g2,
          winner_team_id,
        }),
      })
      let data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao definir resultado do jogo')

      // 2) marcar como terminado (confirmação do representante atual)
      res = await fetch(`${API_BASE_URL}/games/${game._id}/finish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao marcar jogo como terminado')

      closeResultModal()
      await fetchGamesByStatus(tab, teamId)
    } catch (e) {
      alert(e.message || 'Erro ao finalizar jogo')
      setResultModal((s) => ({ ...s, saving: false }))
    }
  }

  // -------- STATS (gamestats) --------

  async function openStatsModal(game) {
    if (game.status !== 'terminado') return

    setStatsModal((s) => ({
      ...s,
      open: true,
      game,
      loading: true,
      playersStats: [],
      members: [],
    }))
    setError('')
    setSelectedPlayer(null)
    setRepStatsForm({ goals: 0, assists: 0 })
    setMyStatsForm({ goals: 0, assists: 0 })

    try {
      const token = localStorage.getItem('token')

      const [statsRes, membersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/gamestats/stats/game/${game._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        teamId && isRep
          ? fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ])

      const statsData = await statsRes.json()
      if (!statsRes.ok)
        throw new Error(statsData?.error || 'Erro ao buscar estatísticas')

      let membersList = []
      if (membersRes) {
        const mData = await membersRes.json()
        if (membersRes.ok) {
          const arr = Array.isArray(mData.members) ? mData.members : mData
          membersList = (arr || []).map((m) => {
            const uid =
              m.uid || m.firebaseUid || m.user_id?.firebaseUid || m.user_id?.uid || ''
            const nome = m.nome || m.name || m.user_id?.nome || 'Jogador'
            return { uid, nome }
          })
        }
      }

      const playersStats = Array.isArray(statsData.jogadores)
        ? statsData.jogadores
        : []

      if (isJog && user?.uid) {
        const mine = playersStats.find((p) => p.firebaseUid === user.uid)
        if (mine) {
          setMyStatsForm({
            goals: mine.goals ?? 0,
            assists: mine.assists ?? 0,
          })
        }
      }

      setStatsModal((s) => ({
        ...s,
        loading: false,
        playersStats,
        members: membersList,
      }))
    } catch (e) {
      setStatsModal((s) => ({ ...s, loading: false }))
      setError(e.message || 'Erro ao carregar stats')
    }
  }

  function closeStatsModal() {
    setStatsModal({
      open: false,
      game: null,
      loading: false,
      playersStats: [],
      members: [],
    })
    setMyStatsForm({ goals: 0, assists: 0 })
    setSelectedPlayer(null)
    setRepStatsForm({ goals: 0, assists: 0 })
  }

  async function sendMyStats() {
    if (!isJog || !statsModal.game || statsModal.game.status !== 'terminado') return
    try {
      const token = localStorage.getItem('token')
      const body = {
        game_id: statsModal.game._id,
        goals: Number(myStatsForm.goals) || 0,
        assists: Number(myStatsForm.assists) || 0,
      }
      const res = await fetch(`${API_BASE_URL}/gamestats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao enviar estatísticas')
      await openStatsModal(statsModal.game)
    } catch (e) {
      alert(e.message)
    }
  }

  async function repSaveStatsForPlayer() {
    if (
      !isRep ||
      !statsModal.game ||
      statsModal.game.status !== 'terminado' ||
      !selectedPlayer?.uid
    ) {
      alert('Selecione um jogador de um jogo finalizado')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const body = {
        game_id: statsModal.game._id,
        firebaseUid: selectedPlayer.uid,
        goals: Number(repStatsForm.goals) || 0,
        assists: Number(repStatsForm.assists) || 0,
      }
      const res = await fetch(`${API_BASE_URL}/gamestats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar estatísticas')
      await openStatsModal(statsModal.game)
    } catch (e) {
      alert(e.message)
    }
  }

  function handleSelectMember(m) {
    setSelectedPlayer(m)
    const existing = statsModal.playersStats.find((p) => p.firebaseUid === m.uid)
    setRepStatsForm({
      goals: existing?.goals ?? 0,
      assists: existing?.assists ?? 0,
    })
  }

  // -------- EFFECTS --------

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (teamId) fetchGamesByStatus(tab, teamId)
  }, [tab, teamId])

  // -------- RENDER --------

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Jogos</h1>
      <p className="text-gray-600 mt-1">
        Selecione seu time para visualizar convites, jogos agendados e resultados.
      </p>

      {loadingTeams ? (
        <div className="text-center py-5">Carregando times...</div>
      ) : (
        <div className="flex gap-2 mt-4 mb-4 flex-wrap">
          {teams.map((t) => {
            const id = String(t.id || t._id)
            const active = teamId === id
            return (
              <Button
                key={id}
                variant={active ? 'default' : 'outline'}
                onClick={() => setTeamId(id)}
              >
                {t.nome || t.name}
              </Button>
            )
          })}
          {teams.length === 0 && (
            <span className="text-sm text-gray-500 pl-3">
              Você não representa nenhum time.
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {['pendente', 'aceito', 'cancelado', 'terminado'].map((st) => (
            <Button
              key={st}
              variant={tab === st ? 'default' : 'outline'}
              onClick={() => setTab(st)}
              disabled={!teamId}
            >
              {STATUS_LABELS[st]}
            </Button>
          ))}
        </div>

        {isRep && (
          <Button disabled={!teamId} onClick={() => setCreateOpen((o) => !o)}>
            Agendar jogo
          </Button>
        )}
      </div>

      {createOpen && isRep && (
        <form
          onSubmit={handleCreateGame}
          className="mb-6 p-4 border rounded-lg bg-white flex flex-wrap gap-4 items-end"
        >
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Adversário</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={form.opponentTeamId}
              onChange={(e) =>
                setForm((f) => ({ ...f, opponentTeamId: e.target.value }))
              }
            >
              <option value="">Selecione um time</option>
              {opponentTeams.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.nome || t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Campo</label>
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Nome do campo"
              value={form.fieldId}
              onChange={(e) =>
                setForm((f) => ({ ...f, fieldId: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Data</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Hora</label>
            <input
              type="time"
              className="border rounded px-2 py-1 text-sm"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Duração (min)</label>
            <input
              type="number"
              min="30"
              step="10"
              className="border rounded px-2 py-1 text-sm"
              value={form.duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, duration: e.target.value }))
              }
            />
          </div>

          <Button type="submit" disabled={creating}>
            {creating ? 'Agendando...' : 'Confirmar convite'}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-9">Carregando jogos...</div>
      ) : error ? (
        <div className="text-red-700 text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
          {games.map((game) => (
            <div
              key={game._id}
              className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-2 border"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">
                  {Array.isArray(game.teams_names)
                    ? game.teams_names.join(' vs ')
                    : 'Times'}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    badgeColors[game.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {STATUS_LABELS[game.status] || game.status}
                </span>
              </div>
              <div className="text-gray-500 text-sm">
                {game.field_name || game.field_id || 'Campo'}
              </div>
              <div className="flex items-center text-gray-700 gap-4 text-sm">
                <span>
                  <i className="fa fa-calendar-o mr-1" />
                  {formatDate(game.scheduled_date)}
                </span>
                <span>
                  <i className="fa fa-clock-o mr-1" />
                  {formatHour(game.scheduled_date)}
                </span>
              </div>

              {tab === 'pendente' && isRep && (
                <div className="mt-3 flex gap-2">
                  {game.i_am_invited && (
                    <Button size="sm" onClick={() => handleAccept(game._id)}>
                      Aceitar convite
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(game._id)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {tab === 'aceito' && isRep && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => handleFinish(game)}>
                    Definir resultado / finalizar
                  </Button>
                </div>
              )}

              {game.status === 'terminado' && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openStatsModal(game)}
                  >
                    Estatísticas
                  </Button>
                </div>
              )}
            </div>
          ))}
          {games.length === 0 && (
            <div className="text-sm text-gray-500 col-span-full text-center mt-8">
              Nenhum jogo nesta categoria para este time.
            </div>
          )}
        </div>
      )}

      {/* Modal de estatísticas */}
      {statsModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                Estatísticas —{' '}
                {statsModal.game?.teams_names?.join(' vs ') || 'Jogo'}
              </h2>
              <button
                className="text-sm text-gray-500 hover:text-gray-800"
                onClick={closeStatsModal}
              >
                Fechar
              </button>
            </div>

            {statsModal.loading ? (
              <div className="py-4 text-sm text-gray-500">Carregando...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isRep && (
                  <div className="md:col-span-1 border-r pr-3">
                    <h3 className="text-sm font-semibold mb-2">
                      Jogadores do time
                    </h3>
                    {statsModal.members.length === 0 ? (
                      <div className="text-xs text-gray-500">
                        Nenhum jogador encontrado para este time.
                      </div>
                    ) : (
                      <ul className="text-xs space-y-1">
                        {statsModal.members.map((m) => {
                          const stats = statsModal.playersStats.find(
                            (p) => p.firebaseUid === m.uid,
                          )
                          const isSel = selectedPlayer?.uid === m.uid
                          return (
                            <li
                              key={m.uid}
                              className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                                isSel ? 'bg-emerald-50' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleSelectMember(m)}
                            >
                              <span className="font-medium">{m.nome}</span>
                              <span className="text-[11px] text-gray-500">
                                G:{stats?.goals ?? 0} • A:{stats?.assists ?? 0}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {isJog && (
                  <div className={isRep ? 'md:col-span-1' : 'md:col-span-2'}>
                    <h3 className="text-sm font-semibold mb-2">
                      Minhas estatísticas
                    </h3>
                    <div className="flex gap-3 items-end text-sm">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-600 mb-1">
                          Gols
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="border rounded px-2 py-1 text-sm w-20"
                          value={myStatsForm.goals}
                          onChange={(e) =>
                            setMyStatsForm((f) => ({
                              ...f,
                              goals: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-600 mb-1">
                          Assistências
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="border rounded px-2 py-1 text-sm w-24"
                          value={myStatsForm.assists}
                          onChange={(e) =>
                            setMyStatsForm((f) => ({
                              ...f,
                              assists: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={sendMyStats}
                        disabled={
                          !statsModal.game ||
                          statsModal.game.status !== 'terminado'
                        }
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}

                {isRep && (
                  <div className={isJog ? 'md:col-span-1' : 'md:col-span-2'}>
                    <h3 className="text-sm font-semibold mb-2">
                      Registrar/ajustar jogador
                    </h3>
                    {selectedPlayer ? (
                      <>
                        <div className="text-xs text-gray-600 mb-2">
                          Selecionado:{' '}
                          <span className="font-semibold">
                            {selectedPlayer.nome}
                          </span>
                        </div>
                        <div className="flex gap-3 items-end text-sm">
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1">
                              Gols
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="border rounded px-2 py-1 text-sm w-20"
                              value={repStatsForm.goals}
                              onChange={(e) =>
                                setRepStatsForm((f) => ({
                                  ...f,
                                  goals: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1">
                              Assistências
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="border rounded px-2 py-1 text-sm w-24"
                              value={repStatsForm.assists}
                              onChange={(e) =>
                                setRepStatsForm((f) => ({
                                  ...f,
                                  assists: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={repSaveStatsForPlayer}
                            disabled={
                              !statsModal.game ||
                              statsModal.game.status !== 'terminado'
                            }
                          >
                            Salvar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Selecione um jogador na lista ao lado para editar.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de resultado do jogo */}
      {resultModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Definir resultado —{' '}
                {resultModal.game?.teams_names?.join(' vs ') || 'Jogo'}
              </h2>
              <button
                className="text-sm text-gray-500 hover:text-gray-800"
                onClick={closeResultModal}
                disabled={resultModal.saving}
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded p-3">
                <p className="font-semibold text-sm mb-2">
                  {resultModal.game?.teams_names?.[0] || 'Time 1'}
                </p>
                <label className="text-xs text-gray-600 mb-1 block">
                  Gols
                </label>
                <input
                  type="number"
                  min="0"
                  className="border rounded px-2 py-1 text-sm w-full"
                  value={resultModal.team1Goals}
                  onChange={(e) =>
                    setResultModal((s) => ({
                      ...s,
                      team1Goals: e.target.value,
                    }))
                  }
                  disabled={resultModal.saving}
                />
              </div>

              <div className="border rounded p-3">
                <p className="font-semibold text-sm mb-2">
                  {resultModal.game?.teams_names?.[1] || 'Time 2'}
                </p>
                <label className="text-xs text-gray-600 mb-1 block">
                  Gols
                </label>
                <input
                  type="number"
                  min="0"
                  className="border rounded px-2 py-1 text-sm w-full"
                  value={resultModal.team2Goals}
                  onChange={(e) =>
                    setResultModal((s) => ({
                      ...s,
                      team2Goals: e.target.value,
                    }))
                  }
                  disabled={resultModal.saving}
                />
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-2">
              Selecione o resultado final:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                type="button"
                size="sm"
                variant={resultModal.winner === 'team1' ? 'default' : 'outline'}
                onClick={() =>
                  setResultModal((s) => ({ ...s, winner: 'team1' }))
                }
                disabled={resultModal.saving}
              >
                {resultModal.game?.teams_names?.[0] || 'Time 1'} venceu
              </Button>
              <Button
                type="button"
                size="sm"
                variant={resultModal.winner === 'draw' ? 'default' : 'outline'}
                onClick={() =>
                  setResultModal((s) => ({ ...s, winner: 'draw' }))
                }
                disabled={resultModal.saving}
              >
                Empate
              </Button>
              <Button
                type="button"
                size="sm"
                variant={resultModal.winner === 'team2' ? 'default' : 'outline'}
                onClick={() =>
                  setResultModal((s) => ({ ...s, winner: 'team2' }))
                }
                disabled={resultModal.saving}
              >
                {resultModal.game?.teams_names?.[1] || 'Time 2'} venceu
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeResultModal}
                disabled={resultModal.saving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmFinish}
                disabled={resultModal.saving}
              >
                {resultModal.saving ? 'Salvando...' : 'Confirmar resultado'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
