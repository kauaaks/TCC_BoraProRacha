import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { MdWarning, MdStar } from "react-icons/md";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const green = "#21633a";
const greenPalette = ["#164b2c", "#21633a", "#278048", "#2d9e57", "#30b768"];

export default function EstatisticasJogador() {
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({});
  const [golsPorMes, setGolsPorMes] = useState([]);
  const [assistsPorMes, setAssistsPorMes] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    // Dados simulados; substitua pela API real se disponível
    setProfile({
      avatar: null,
      name: "João da Silva",
      position: "Atacante",
      age: 22,
      status: "Ativo",
    });
    setStats({
      matches: 18,
      gols: 14,
      assists: 6,
      yellows: 3,
      minutes: 1560,
      presencePct: 85,
    });
    setGolsPorMes([0, 2, 2, 1, 3, 2, 1, 1, 1, 0, 1, 0]);
    setAssistsPorMes([1, 0, 1, 2, 0, 1, 0, 0, 0, 0, 1, 0]);
    setRecentGames([
      { id: 1, opponent: "Time Alpha", result: "Vitória", score: "3x1", gols: 1, assists: 1, yellow: false },
      { id: 2, opponent: "Time Beta", result: "Derrota", score: "0x2", gols: 0, assists: 0, yellow: true },
      { id: 3, opponent: "Time Zeta", result: "Empate", score: "2x2", gols: 2, assists: 0, yellow: false },
    ]);
    setRanking([
      { name: "João da Silva", gols: 14 },
      { name: "Pedro Santos", gols: 16 },
      { name: "Carlos Lima", gols: 13 },
    ]);
    setAlerts([
      { id: 1, message: "Pendurado: mais 2 cartões para suspensão." },
      { id: 2, message: "Recomendação: participar de treino extra de finalização." },
    ]);
    setAwards([
      { id: 1, title: "Artilheiro do mês - Abril" },
      { id: 2, title: "Melhor em campo na rodada 10" },
    ]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Perfil */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-24 h-24 rounded-full bg-green-200 flex items-center justify-center text-green-900 text-4xl font-bold">
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <span>{profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-700">
            {profile.position} • {profile.age} anos
          </p>
          <p className="text-green-700 font-semibold">Status: {profile.status}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard value={stats.matches} label="Partidas" />
        <StatCard value={stats.gols} label="Gols" />
        <StatCard value={stats.assists} label="Assistências" />
        <StatCard value={stats.yellows} label="Amarelos" />
      </div>

      {/* Evolução */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <ChartCard title="Evolução dos Gols por mês">
          <Line
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              datasets: [
                { label: "Gols", data: golsPorMes, borderColor: green, backgroundColor: "rgba(33,99,58,0.1)", fill: true, tension: 0.3 }
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
            height={100}
          />
        </ChartCard>

        <ChartCard title="Evolução das Assistências por mês">
          <Line
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              datasets: [
                { label: "Assistências", data: assistsPorMes, borderColor: greenPalette[2], backgroundColor: "rgba(39,128,72,0.1)", fill: true, tension: 0.3 }
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
            height={100}
          />
        </ChartCard>
      </div>

      {/* Últimos jogos */}
      <CardSection title="Últimos jogos">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-1 text-left">Adversário</th>
              <th className="border px-3 py-1">Resultado</th>
              <th className="border px-3 py-1">Placar</th>
              <th className="border px-3 py-1">Gols</th>
              <th className="border px-3 py-1">Assistências</th>
              <th className="border px-3 py-1">Cartão</th>
            </tr>
          </thead>
          <tbody>
            {recentGames.map(game => (
              <tr key={game.id} className="border-t hover:bg-gray-50">
                <td className="border px-3 py-1">{game.opponent}</td>
                <td className={`border px-3 py-1 font-semibold ${
                  game.result === "Vitória" ? "text-green-700" :
                  game.result === "Derrota" ? "text-red-500" : "text-yellow-700"
                }`}>{game.result}</td>
                <td className="border px-3 py-1 text-center">{game.score}</td>
                <td className="border px-3 py-1 text-center">{game.gols}</td>
                <td className="border px-3 py-1 text-center">{game.assists}</td>
                <td className="border px-3 py-1 text-center">{game.yellow ? "🟨" : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardSection>

      {/* Ranking */}
      <CardSection title="Ranking de Gols do Time">
        <div>
          {ranking
            .sort((a,b) => b.gols - a.gols)
            .map((player, i) => (
              <div key={player.name} className="flex justify-between py-2 border-b last:border-b-0">
                <span className="font-semibold text-green-900">{i+1}º. {player.name}</span>
                <span className="text-green-800">{player.gols} gols</span>
                {player.name === profile.name && <MdStar className="inline text-yellow-500" />}
              </div>
            ))
          }
        </div>
      </CardSection>

      {/* Premiações */}
      <CardSection title="Premiações e Destaques">
        {awards.length === 0 && <p className="italic text-gray-600">Nenhuma premiação registrada.</p>}
        {awards.map(award => (
          <div key={award.id} className="flex items-center gap-2 py-1">
            <MdStar className="text-yellow-400" />
            <span>{award.title}</span>
          </div>
        ))}
      </CardSection>

      {/* Alertas */}
      <CardSection title="Alertas e Feedback" alert>
        {alerts.length === 0 && <p className="italic text-gray-600">Nenhum alerta no momento.</p>}
        {alerts.map(alert => (
          <div key={alert.id} className="bg-red-500 text-white rounded p-2 mb-2">
            <MdWarning className="text-red-900 inline-block mr-1" />
            <span>{alert.message}</span>
          </div>
        ))}
      </CardSection>
    </div>
  );
}

// Componente reutilizável para estruturar os cards de gráfico com título
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="font-bold text-lg mb-3 text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

// Componente reutilizável para seções com título
function CardSection({ title, children, alert }) {
  return (
    <section className={`mb-10 p-6 bg-white rounded-xl shadow-md ${alert ? "border" : ""}`}>
      <h2 className="font-bold text-xl mb-5">{title}</h2>
      {children}
    </section>
  );
}

// Componente para cards numéricos simples
function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-2 border">
      <span className="font-bold text-2xl text-green-800">{value}</span>
      <span className="text-gray-700">{label}</span>
    </div>
  );
}
