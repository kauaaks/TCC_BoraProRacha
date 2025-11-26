import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function formatDateTime(iso) {
  if (!iso) return '--'
  const d = new Date(iso)
  const data = d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
  const hora = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${data} • ${hora}`
}

export default function PlayerDashboard({ data }) {
  const { user } = useAuth()

  const allGames = Array.isArray(data?.games) ? data.games : []

  // só jogos agendados (status 'aceito') e com data futura
  const now = new Date()
  const upcomingGames = allGames
    .filter((g) => g.status === 'aceito' && g.scheduled_date && new Date(g.scheduled_date) > now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime(),
    )

  const nextThree = upcomingGames.slice(0, 3)

  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          BoraProRacha, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Jogador •{' '}
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Próximos Jogos</CardTitle>
            </div>
            <Calendar className="w-5 h-5 text-emerald-700" />
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              Você tem <b>{upcomingGames.length}</b> jogo(s) futuros agendados.
            </p>

            {upcomingGames.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhum jogo agendado no momento.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {nextThree.map((g) => (
                  <div
                    key={g._id}
                    className="border rounded-lg px-3 py-2 text-sm flex flex-col"
                  >
                    <span className="font-semibold text-gray-800">
                      {Array.isArray(g.teams_names)
                        ? g.teams_names.join(' vs ')
                        : 'Partida agendada'}
                    </span>
                    <span className="text-gray-600">
                      {formatDateTime(g.scheduled_date)}
                    </span>
                    {g.field_name && (
                      <span className="text-gray-500">Campo: {g.field_name}</span>
                    )}
                  </div>
                ))}
                {upcomingGames.length > 3 && (
                  <p className="text-xs text-gray-500">
                    + {upcomingGames.length - 3} jogo(s) agendado(s) mais à frente.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
