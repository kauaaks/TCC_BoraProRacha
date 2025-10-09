import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Plus, 
  Search, 
  Settings, 
  Crown,
  UserPlus,
  DollarSign,
  Calendar,
  MoreVertical
} from 'lucide-react'

export default function Teams() {
  const { user, apiCall } = useAuth()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    monthly_fee: 30
  })

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/teams')
      setTeams(response.teams || [])
    } catch (error) {
      console.error('Erro ao carregar times:', error)
      setError('Erro ao carregar times')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await apiCall('/teams', {
        method: 'POST',
        body: JSON.stringify(newTeam)
      })

      setSuccess('Time criado com sucesso!')
      setNewTeam({ name: '', description: '', monthly_fee: 30 })
      setIsCreateDialogOpen(false)
      loadTeams()
    } catch (error) {
      setError(error.message || 'Erro ao criar time')
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTeamStatusBadge = (team) => {
    if (!team.is_active) {
      return <Badge variant="secondary">Inativo</Badge>
    }
    
    const memberCount = team.member_count || 0
    if (memberCount >= 20) {
      return <Badge className="bg-green-500">Completo</Badge>
    } else if (memberCount >= 15) {
      return <Badge className="bg-yellow-500">Quase Completo</Badge>
    } else {
      return <Badge variant="outline">Ativo</Badge>
    }
  }

  const canCreateTeam = () => {
    return user?.user_type === 'admin' || 
           user?.user_type === 'team_rep' || 
           user?.user_type === 'field_manager'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Times</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus times de futebol society
          </p>
        </div>
        
        {canCreateTeam() && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-appsociety-green hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Time</DialogTitle>
                <DialogDescription>
                  Preencha as informações básicas do time
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Time</Label>
                  <Input
                    id="name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="Ex: Amigos FC"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    placeholder="Descrição do time..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthly_fee">Mensalidade (R$)</Label>
                  <Input
                    id="monthly_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newTeam.monthly_fee}
                    onChange={(e) => setNewTeam({ ...newTeam, monthly_fee: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-appsociety-green hover:bg-green-600">
                    Criar Time
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Alertas */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar times..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Times */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{team.name}</span>
                      {team.created_by === user?.id && (
                        <Crown className="w-4 h-4 text-yellow-500" title="Você é o criador" />
                      )}
                    </CardTitle>
                    {team.description && (
                      <CardDescription className="text-sm">
                        {team.description}
                      </CardDescription>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  {getTeamStatusBadge(team)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Estatísticas do Time */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{team.member_count || 0} membros</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span>{formatCurrency(team.monthly_fee)}</span>
                  </div>
                </div>

                {/* Data de Criação */}
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Criado em {new Date(team.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-1" />
                    Gerenciar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Membros
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando seu primeiro time de futebol society'
            }
          </p>
          {!searchTerm && canCreateTeam() && (
            <Button 
              className="bg-appsociety-green hover:bg-green-600"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Time
            </Button>
          )}
        </div>
      )}
    </div>
  )
}