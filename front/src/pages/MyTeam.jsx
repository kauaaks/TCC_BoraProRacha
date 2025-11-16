import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Users, UserPlus, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import GameStatsForm from '../components/forms/GameStatsForm'

export default function MyTeam() {
  const { user, apiCall } = useAuth()
  const [teams, setTeams] = useState([])        // lista de times do usuário
  const [activeTeam, setActiveTeam] = useState(null) // time selecionado para ver detalhes/membros
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamsAndMaybeFirst()
  }, [])

  const loadTeamsAndMaybeFirst = async () => {
    try {
      setLoading(true)
      // busca todos os times do usuário
      const teamRes = await apiCall('/teams/meustimes')
      const list = teamRes?.teams || []
      setTeams(Array.isArray(list) ? list : [])

      // seleciona o primeiro automaticamente (se quiser)
      if (Array.isArray(list) && list.length > 0) {
        const first = list[0]
        setActiveTeam(first)
        await loadMembers(first.id)
      } else {
        setActiveTeam(null)
        setMembers([])
      }
    } catch (error) {
      console.error('Erro ao carregar times do usuário:', error)
      setTeams([])
      setActiveTeam(null)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async (teamId) => {
    try {
      const membersRes = await apiCall(`/teams/${teamId}/members`)
      setMembers(membersRes?.members || [])
    } catch (e) {
      console.error('Erro ao carregar membros:', e)
      setMembers([])
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
            {teams.map((t) => (
              <Card
                key={t.id || t._id}
                className={`cursor-pointer ${activeTeam?.id === (t.id || t._id) ? 'ring-2 ring-blue-500' : ''}`}
                onClick={async () => {
                  setActiveTeam(t)
                  await loadMembers(t.id || t._id)
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
                  <p>Mensalidade: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(Number(t.monthly_fee || 0))}</p>
                  <p>Membros: {t.member_count ?? (Array.isArray(t.members) ? t.members.length : 0)}</p>
                </CardContent>
              </Card>
            ))}
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Enviar Estatísticas do Jogo</span>
                  </CardTitle>
                  <CardDescription>Preencha os dados dos destaques da última partida</CardDescription>
                </CardHeader>
                <CardContent>
                  <GameStatsForm teamId={activeTeam.id || activeTeam._id} />
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
