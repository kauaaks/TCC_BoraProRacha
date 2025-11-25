import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useAuth } from "../contexts/AuthContext";
import { MdWarning } from "react-icons/md";

const green = "#21633a";
const greenPalette = [
  "#164b2c", "#21633a", "#278048", "#2d9e57", "#30b768",
  "#36c978", "#3cdb87", "#5bd09a", "#7dd5ad"
];

function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-2 border">
      <span className="font-bold text-2xl text-green-800">{value}</span>
      <span className="text-gray-700">{label}</span>
    </div>
  );
}

function PlayerStatCard({ player }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border flex flex-col items-center">
      <span className="font-bold text-lg text-green-900">{player.name}</span>
      <div className="mt-2 w-full flex flex-col gap-1">
        <div className="flex justify-between text-sm">
          <span>Gols</span>
          <span className="font-semibold">{player.goals}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Partidas</span>
          <span className="font-semibold">{player.matches}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Amarelos</span>
          <span className="font-semibold">{player.yellowCards}</span>
        </div>
      </div>
    </div>
  );
}

export default function EstatisticasRepresentante() {
  const { user } = useAuth();
  const [teamStats, setTeamStats] = useState(null);
  const [playerDetails, setPlayerDetails] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pieDetail, setPieDetail] = useState({
    labels: ["Atacante", "Meio-campo", "Defensor", "Goleiro"],
    players: [8, 6, 7, 2],
  });

  useEffect(() => {
    if (!user) return;

    setTeamStats({
      teamName: "Time Exemplo",
      playersCount: 23,
      matchesPlayed: 50,
      wins: 40,
      months: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      winsPerMonth: [5, 3, 3, 5, 10, 4, 2, 2, 2, 2, 1, 0],
    });

    setPlayerDetails([
      { id: 1, name: "Jogador A", goals: 5, matches: 25, yellowCards: 2 },
      { id: 2, name: "Jogador B", goals: 3, matches: 20, yellowCards: 1 },
      { id: 3, name: "Jogador C", goals: 8, matches: 23, yellowCards: 3 },
    ]);

    setAlerts([
      { id: 1, message: "Jogador A está suspenso para a próxima partida." },
      { id: 2, message: "Jogador C sofreu contusão leve." },
    ]);
  }, [user]);

  if (!teamStats) return <div>Carregando estatísticas...</div>;

  return (
    <div className="max-w-6xl mx-auto px-8 pt-8 pb-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Estatísticas do Time</h1>
      <p className="text-gray-600 mb-8">Visão detalhada do seu time durante o campeonato.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard value={teamStats.playersCount} label="Jogadores" />
        <StatCard value={teamStats.matchesPlayed} label="Partidas" />
        <StatCard value={teamStats.wins} label="Vitórias" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-lg mb-3 text-gray-900">
            Vitórias por mês no ano
          </h2>
          <Bar
            data={{
              labels: teamStats.months,
              datasets: [
                { label: "Vitórias", data: teamStats.winsPerMonth, backgroundColor: green },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
            height={90}
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center">
          <h2 className="font-bold text-lg mb-3 text-gray-900 text-center">
            Distribuição por posição
          </h2>
          <div style={{ width: 220, height: 220 }}>
            <Pie
              data={{
                labels: pieDetail.labels,
                datasets: [
                  { label: "Jogadores", data: pieDetail.players, backgroundColor: greenPalette },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-bold text-lg mb-4">Estatísticas Individuais dos Jogadores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {playerDetails.map(player => (
            <PlayerStatCard key={player.id} player={player} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-lg mb-4 text-black">Alertas e Notificações</h2>
        <div className="space-y-4">
          {alerts.length === 0 && (
            <p className="italic text-gray-600">Sem notificações no momento.</p>
          )}
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="bg-red-500 hover:bg-red-400 flex items-center gap-2 p-3 rounded border border-red-300 bg-red-50"
            >
              <MdWarning className="w-5 h-5 text-red-900" />
              <span className="font-semibold text-white">{alert.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
