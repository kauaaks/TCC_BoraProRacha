import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function PlayerDashboard({ data }) {
  const { user } = useAuth()
  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Bora pro Racha, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Jogador • {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Jogos</CardTitle>
            <Calendar className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <p>Você tem {data.games.length} jogos futuros.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}