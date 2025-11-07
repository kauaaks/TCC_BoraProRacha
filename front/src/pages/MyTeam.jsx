import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Users, UserPlus, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import GameStatsForm from '../components/forms/GameStatsForm'

export default function MyTeam() {
  const { user, apiCall } = useAuth()
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamInfo()
  }, [])

  const loadTeamInfo = async () => {
    try {
      setLoading(true)
      const teamRes = await apiCall('/teams/my-team')
      const membersRes = await apiCall(`/teams/${teamRes.team.id}/members`)

      setTeam(teamRes.team)
      setMembers(membersRes.members || [])
    } catch (error) {
      console.error('Erro ao carregar informações do time:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Meu Time</h1>

      {loading ? (
        <div className="text-gray-500">Carregando informações...</div>
      ) : team ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{team.name}</span>
              </CardTitle>
              <CardDescription>{team.description || 'Sem descrição cadastrada'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Categoria: {team.category || 'N/D'}</p>
              <p className="text-sm text-gray-600">Criado em: {new Date(team.created_at).toLocaleDateString('pt-BR')}</p>
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
                members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <Badge variant="outline">{member.position || 'Jogador'}</Badge>
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
              <GameStatsForm teamId={team.id} />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-red-500">Nenhum time vinculado a este usuário.</div>
      )}
    </div>
  )
}