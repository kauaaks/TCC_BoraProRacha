import React, { useEffect, useState } from 'react'

const mockStats = [
  { id: 1, title: "Partidas Jogadas", value: 12 },
  { id: 2, title: "Gols Marcados", value: 7 },
  { id: 3, title: "Cartões Amarelos", value: 2 },
  { id: 4, title: "Cartões Vermelhos", value: 0 },
  { id: 5, title: "Assistências", value: 4 }
]

export default function Estatisticas() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 800)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Estatísticas</h1>
      <p className="text-gray-600 mt-1">Veja seus principais números como jogador.</p>
      {loading ? (
        <div className="text-center py-9">Carregando estatísticas...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mt-6">
          {stats.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center gap-2 border">
              <span className="font-bold text-2xl text-primary">{s.value}</span>
              <span className="text-gray-700">{s.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
