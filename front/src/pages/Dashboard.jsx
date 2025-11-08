// src/components/dashboards/AdminDashboard.jsx
// ... (resto dos dashboards mantido como está acima)
// src/pages/Dashboard.jsx
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
  user_type: user.user_type,  // pode não existir, depende de onde você guarda isso
  displayName: user.displayName,
  // outras propriedades customizadas
})

  const [data, setData] = useState({ teams: [], games: [], payments: [] })
  const [loading, setLoading] = useState(true)

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

  if (user?.user_type === 'admin') return <AdminDashboard data={data} />
  if (user?.user_type === 'gestor_campo') return <FieldManagerDashboard data={data} />
  if (user?.user_type === 'representante_time') return <TeamRepDashboard data={data} />
  if (user?.user_type === 'jogador') return <PlayerDashboard data={data} />

  return <div className="p-6">Perfil de usuário desconhecido.</div>
}
