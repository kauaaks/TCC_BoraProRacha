import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function AdminPanel() {
  const { user } = useAuth()

  if (!user || user.user_type !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Painel do Administrador</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total de Usuários</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">123</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pagamentos Pendentes</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">R$ 2.350,00</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Times Ativos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">18</p></CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Ações rápidas</h2>
        <p>Futuramente: Criar usuário, visualizar relatórios, etc.</p>
      </div>
    </div>
  )
}