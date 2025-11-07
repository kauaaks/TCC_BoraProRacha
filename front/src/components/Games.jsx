import React, { useEffect, useState } from 'react'

const mockGames = [
  {
    id: 1,
    teamA: 'Canela FC',
    teamB: 'Vale FC',
    date: '12/11/2025',
    time: '15:00',
    place: 'Arena Society',
    status: 'Agendado'
  },
  {
    id: 2,
    teamA: 'Floresta FC',
    teamB: 'Praia FC',
    date: '18/11/2025',
    time: '20:00',
    place: 'Estádio Central',
    status: 'Realizado'
  },
  {
    id: 3,
    teamA: 'Serra FC',
    teamB: 'Lagoa FC',
    date: '25/11/2025',
    time: '18:30',
    place: 'Arena Society',
    status: 'Cancelado'
  }
]

const badgeColors = {
  Agendado: 'bg-blue-100 text-blue-800',
  Realizado: 'bg-green-100 text-green-800',
  Cancelado: 'bg-red-100 text-red-800'
}

export default function Games() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setGames(mockGames)
      setLoading(false)
    }, 800)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Jogos</h1>
      <p className="text-gray-600 mt-1">Acompanhe seus próximos jogos, resultados e status das partidas.</p>
      {loading ? (
        <div className="text-center py-9">Carregando jogos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {games.map(game => (
            <div key={game.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-2 border">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{game.teamA} <span className="text-gray-400 font-normal">vs</span> {game.teamB}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColors[game.status] || 'bg-gray-100 text-gray-600'}`}>{game.status}</span>
              </div>
              <div className="text-gray-500 text-sm">{game.place}</div>
              <div className="flex items-center text-gray-700 gap-4 text-sm">
                <span>
                  <i className="fa fa-calendar-o mr-1" />{game.date}
                </span>
                <span>
                  <i className="fa fa-clock-o mr-1" />{game.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
