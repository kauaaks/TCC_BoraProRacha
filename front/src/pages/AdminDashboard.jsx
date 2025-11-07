import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, CreditCard, ShieldAlert, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user, apiCall } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    teams: 0,
    fields: 0,
    payments: 0,
    managers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.user_type !== 'admin') {
      navigate('/dashboard')
    } else {
      fetchAdminStats()
    }
  }, [user])

  const fetchAdminStats = async () => {
    setLoading(true)
    try {
      const [teams, fields, payments, users] = await Promise.all([
        apiCall('/teams'),
        apiCall('/fields'),
        apiCall('/payments'),
        apiCall('/users')
      ])

      const managerCount = users.users.filter(u => u.user_type === 'field_manager').length

      setStats({
        teams: teams.teams?.length || 0,
        fields: fields.fields?.length || 0,
        payments: payments.payments?.length || 0,
        managers: managerCount || 0
      })
    } catch (err) {
      console.error('Erro ao carregar estatísticas do admin:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="p-4">Carregando estatísticas...</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Painel do Administrador</h1>
      <p className="text-gray-600">Resumo das entidades da plataforma</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Times</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.teams}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <CardTitle>Campos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.fields}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <CardTitle>Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.payments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <CardTitle>Gestores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.managers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <h2 className="text-lg font-semibold">Próximos passos</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
          <li>Criar relatórios de uso e receita</li>
          <li>Gerenciar assinaturas e configurações globais</li>
          <li>Controlar permissões e acesso de usuários</li>
          <li>Habilitar workflows automáticos</li>
        </ul>
      </div>
    </div>
  )
}