import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AdminDashboard from '@/components/dashboards/AdminDashboard'
import FieldManagerDashboard from '@/components/dashboards/FieldManagerDashboard'
import TeamRepDashboard from '@/components/dashboards/TeamRepDashboard'
import PlayerDashboard from '@/components/dashboards/PlayerDashboard'

export default function Dashboard() {
  const { user, apiCall } = useAuth()
  console.log('Usuário simplificado:', {
    uid: user.uid,
    email: user.email,
    user_type: user.user_type,
    displayName: user.displayName,
  })

  const [data, setData] = useState({ teams: [], games: [], payments: [] })
  const [loading, setLoading] = useState(true)
  const [hasTeam, setHasTeam] = useState(true) // assume que tem time até checar

  // Checar times do jogador para mostrar banner se não tiver nenhum
  useEffect(() => {
    if (user && user.user_type === 'jogador') {
      apiCall('/teams/meustimes')
        .then(r => setHasTeam(Array.isArray(r) && r.length > 0))
        .catch(() => setHasTeam(false))
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const promises = []

        if (user?.user_type === 'admin') {
          promises.push(
            apiCall('/teams'),
            apiCall('/games'),
            apiCall('/payments')
          )
        } else if (user?.user_type === 'gestor_campo') {
          promises.push(
            apiCall('/fields'),
            apiCall('/games'),
            apiCall('/teams')
          )
        } else if (user?.user_type === 'representante_time') {
          promises.push(
            apiCall('/teams'),
            apiCall('/games'),
            apiCall('/payments')
          )
        } else if (user?.user_type === 'jogador') {
          promises.push(apiCall('/games'))
        }

        const results = await Promise.allSettled(promises)

        const [a, b, c] = results.map(r => (r.status === 'fulfilled' ? r.value : []))
        setData({
          teams: a?.teams || a?.fields || [],
          games: b?.games || [],
          payments: c?.payments || c?.teams || []
        })
      } catch (err) {
        console.error(err)
        setData({ teams: [], games: [], payments: [] })
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
  }, [user])

  if (loading) return <div className="p-6">Carregando...</div>

  if (user?.user_type === 'jogador' && !hasTeam) {
    return (
      <div className="p-6">
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded shadow">
          <strong>Você ainda não faz parte de nenhum time!</strong>
          <div className="mt-2">
            Solicite o código/link do time a um representante e clique no botão abaixo para ingressar.
          </div>
          <button
            onClick={() => window.location.href = '/invitations/join'}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
          >
            Entrar em um time
          </button>
        </div>
        <div>Sua área será liberada assim que você se associar a um time.</div>
      </div>
    )
  }

  if (user?.user_type === 'admin') return <AdminDashboard data={data} />
  if (user?.user_type === 'gestor_campo') return <FieldManagerDashboard data={data} />
  if (user?.user_type === 'representante_time') return <TeamRepDashboard data={data} />
  if (user?.user_type === 'jogador') return <PlayerDashboard data={data} />

  return <div className="p-6">Perfil de usuário desconhecido.</div>
}
