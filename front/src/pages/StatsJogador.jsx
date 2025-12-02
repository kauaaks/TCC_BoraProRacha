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
import { useAuth } from "../contexts/AuthContext";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const green = "#21633a";
const greenPalette = ["#164b2c", "#21633a", "#278048", "#2d9e57", "#30b768"];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function EstatisticasJogador() {
  const { user, apiCall } = useAuth();

  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({});
  const [golsPorMes, setGolsPorMes] = useState([]);
  const [assistsPorMes, setAssistsPorMes] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar ? `${API_BASE_URL}${user?.avatar}` : null
  );

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(`${API_BASE_URL}${user?.avatar}`);
    } else {
      setAvatarUrl(null);
    }
  }, [user?.avatar]);

  useEffect(() => {
    if (!user) return;

    async function loadPlayerStats() {
      try {
        setLoading(true);
        setError("");
        const res = await apiCall("/playerstats/me");
        if (res?.error) throw new Error(res.error);

        const p = res.profile || {};
        const s = res.stats || {};

        setProfile({
          avatar: p.avatar || null,
          name: p.name || user.displayName || "Jogador",
          position: p.position || "Atacante",
          age: p.age || 0,
          status: p.status || "Ativo",
        });

        setStats({
          matches: s.matches ?? 0,
          gols: s.gols ?? 0,
          assists: s.assists ?? 0,
        });

        const gpm = Array.isArray(res.golsPorMes) ? res.golsPorMes : [];
        const apm = Array.isArray(res.assistsPorMes) ? res.assistsPorMes : [];
        setGolsPorMes(MONTH_LABELS.map((_, i) => gpm[i] ?? 0));
        setAssistsPorMes(MONTH_LABELS.map((_, i) => apm[i] ?? 0));

        setRecentGames(Array.isArray(res.recentGames) ? res.recentGames : []);
        setRanking(Array.isArray(res.ranking) ? res.ranking : []);
        setAlerts(Array.isArray(res.alerts) ? res.alerts : []);
        setAwards(Array.isArray(res.awards) ? res.awards : []);
      } catch (err) {
        console.error("Erro ao carregar estatísticas do jogador:", err);
        setError("Não foi possível carregar suas estatísticas.");
        setProfile({});
        setStats({});
        setGolsPorMes([]);
        setAssistsPorMes([]);
        setRecentGames([]);
        setRanking([]);
        setAlerts([]);
        setAwards([]);
      } finally {
        setLoading(false);
      }
    }

    loadPlayerStats();
  }, [user, apiCall]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-500">Carregando estatísticas do jogador...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {error && (
        <p className="text-sm text-red-500 mb-4">
          {error}
        </p>
      )}

      {/* Perfil */}
      <div className="flex items-center gap-6 mb-10 ">
        <div className="w-24 h-24 rounded-full bg-green-200 flex items-center justify-center text-green-900 text-4xl font-bold overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <span>
              {profile.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-700">
            {profile.position}
          </p>
          <p className="text-green-700 font-semibold">Status: {profile.status}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <StatCard value={stats.matches ?? 0} label="Partidas" />
        <StatCard value={stats.gols ?? 0} label="Gols" />
        <StatCard value={stats.assists ?? 0} label="Assistências" />
      </div>

      {/* Evolução */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <ChartCard title="Evolução dos Gols por mês">
          <Line
            data={{
              labels: MONTH_LABELS,
              datasets: [
                {
                  label: "Gols",
                  data: golsPorMes,
                  borderColor: green,
                  backgroundColor: "rgba(33,99,58,0.1)",
                  fill: true,
                  tension: 0.3,
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
            height={100}
          />
        </ChartCard>

        <ChartCard title="Evolução das Assistências por mês">
          <Line
            data={{
              labels: MONTH_LABELS,
              datasets: [
                {
                  label: "Assistências",
                  data: assistsPorMes,
                  borderColor: greenPalette[2],
                  backgroundColor: "rgba(39,128,72,0.1)",
                  fill: true,
                  tension: 0.3,
                },
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
            </tr>
          </thead>
          <tbody>
            {recentGames.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border px-3 py-2 text-center text-gray-500"
                >
                  Nenhum jogo registrado ainda.
                </td>
              </tr>
            ) : (
              recentGames.map((game) => (
                <tr key={game.id} className="border-t hover:bg-gray-50">
                  <td className="border px-3 py-1">{game.opponent}</td>
                  <td
                    className={`border px-3 py-1 font-semibold ${
                      game.result === "Vitória"
                        ? "text-green-700"
                        : game.result === "Derrota"
                        ? "text-red-500"
                        : "text-yellow-700"
                    }`}
                  >
                    {game.result}
                  </td>
                  <td className="border px-3 py-1 text-center">{game.score}</td>
                  <td className="border px-3 py-1 text-center">{game.gols}</td>
                  <td className="border px-3 py-1 text-center">
                    {game.assists}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardSection>

      {/* Ranking */}
      <CardSection title="Ranking de Gols do Time">
        <div>
          {ranking.length === 0 ? (
            <p className="text-sm text-gray-500">
              Ainda não há ranking de gols para o seu time.
            </p>
          ) : (
            ranking
              .sort((a, b) => b.gols - a.gols)
              .map((player, i) => (
                <div
                  key={player.uid || player.name}
                  className="flex justify-between py-2 border-b last:border-b-0"
                >
                  <span className="font-semibold text-green-900">
                    {i + 1}º. {player.name}
                  </span>
                  <span className="text-green-800">{player.gols} gols</span>
                  {player.name === profile.name && (
                    <MdStar className="inline text-yellow-500" />
                  )}
                </div>
              ))
          )}
        </div>
      </CardSection>

      {/* Premiações */}
      <CardSection title="Premiações e Destaques">
        {awards.length === 0 && (
          <p className="italic text-gray-600">Nenhuma premiação registrada.</p>
        )}
        {awards.map((award) => (
          <div key={award.id} className="flex items-center gap-2 py-1">
            <MdStar className="text-yellow-400" />
            <span>{award.title}</span>
          </div>
        ))}
      </CardSection>

      {/* Alertas */}
      <CardSection title="Alertas e Feedback" alert>
        {alerts.length === 0 && (
          <p className="italic text-gray-600">Nenhum alerta no momento.</p>
        )}
        {alerts.map((alert) => (
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
    <section
      className={`mb-10 p-6 bg-white rounded-xl shadow-md ${
        alert ? "border" : ""
      }`}
    >
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
