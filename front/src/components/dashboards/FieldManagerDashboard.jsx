import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Calendar, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function FieldManagerDashboard({ data }) {
  const { user } = useAuth()
  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          BoraProRacha, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Gestor de Campo • {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Campos</CardTitle><Users /></CardHeader><CardContent><div className="text-2xl font-bold">{data.teams.length}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Jogos</CardTitle><Calendar /></CardHeader><CardContent><div className="text-2xl font-bold">{data.games.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Administre seus campos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="w-6 h-6" />
              <span className="text-sm">Cadastrar Time</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}