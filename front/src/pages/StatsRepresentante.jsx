import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useAuth } from "../contexts/AuthContext";
import { MdWarning } from "react-icons/md";

const green = "#21633a";
const greenPalette = [
  "#164b2c", "#21633a", "#278048", "#2d9e57", "#30b768",
  "#36c978", "#3cdb87", "#5bd09a", "#7dd5ad"
];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];


// base da API para montar URL absoluta do escudo
const API_BASE_URL = import.meta.env.VITE_API_URL;
const toAbsolute = (u) => (u?.startsWith?.("http") ? u : `${API_BASE_URL}${u}`);

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
  const { user, apiCall } = useAuth();

  const [teams, setTeams] = useState([]);             
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [teamStats, setTeamStats] = useState(null);
  const [playerDetails, setPlayerDetails] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pieDetail, setPieDetail] = useState({
    labels: [],
    players: [],
  });

  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function loadTeams() {
      try {
        setLoadingTeams(true);
        setError("");
        const res = await apiCall("/teams/meustimes");
        const list = res?.teams || [];
        setTeams(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Erro ao buscar times para estatísticas:", err);
        setTeams([]);
        setError("Não foi possível carregar os times.");
      } finally {
        setLoadingTeams(false);
      }
    }

    loadTeams();
  }, [user, apiCall]);

  useEffect(() => {
    if (!user || !selectedTeam) return;

    async function loadStats() {
      try {
        setLoadingStats(true);
        setError("");

        const teamId = selectedTeam.id || selectedTeam._id;
        const statsRes = await apiCall(`/teamstats/${teamId}`);
        if (statsRes?.error) {
          throw new Error(statsRes.error);
        }

        const overview = statsRes.overview || {};

        const winsByMonth = Array.isArray(statsRes.winsByMonth)
          ? statsRes.winsByMonth
          : [];
        const winsPerMonth = MONTH_LABELS.map((_, idx) => {
          const rec = winsByMonth.find((m) => m.month === idx + 1);
          return rec ? rec.wins : 0;
        });

        setTeamStats({
          teamName: statsRes.team_name || selectedTeam.nome || selectedTeam.name,
          playersCount: overview.playersCount ?? 0,
          matchesPlayed: overview.matchesCount ?? 0,
          wins: overview.winsCount ?? 0,
          months: MONTH_LABELS,
          winsPerMonth,
        });

        const players = Array.isArray(statsRes.players) ? statsRes.players : [];
        setPlayerDetails(
          players.map((p, index) => ({
            id: index + 1,
            name: p.nome || "Jogador",
            goals: p.goals ?? 0,
            matches: p.matches ?? 0,
            yellowCards: 0,
          }))
        );

        const pos = Array.isArray(statsRes.positionsDistribution)
          ? statsRes.positionsDistribution
          : [];
        if (pos.length) {
          setPieDetail({
            labels: pos.map((p) => p.label),
            players: pos.map((p) => p.value),
          });
        } else {
          setPieDetail({ labels: [], players: [] });
        }

        const alertsArr = Array.isArray(statsRes.alerts) ? statsRes.alerts : [];
        setAlerts(
          alertsArr.map((a, index) => ({
            id: a.id || index + 1,
            message: a.message || String(a),
          }))
        );
      } catch (err) {
        console.error("Erro ao carregar estatísticas do time:", err);
        setError("Não foi possível carregar as estatísticas desse time.");
        setTeamStats(null);
        setPlayerDetails([]);
        setAlerts([]);
        setPieDetail({ labels: [], players: [] });
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, [user, selectedTeam, apiCall]);

  if (!selectedTeam) {
    return (
      <div className="space-y-6 fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Estatísticas do Time
        </h1>
        <p className="text-gray-600 mb-6">
          Selecione um dos seus times para visualizar as estatísticas detalhadas.
        </p>

        {loadingTeams ? (
          <div className="text-gray-500">Carregando seus times...</div>
        ) : teams.length === 0 ? (
          <div className="text-red-500">
            Nenhum time vinculado a este usuário.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => {
              const id = t.id || t._id;
              const shieldSrc = t.logo_url ? toAbsolute(t.logo_url) : null;

              return (
                <button
                  key={id}
                  type="button"
                  className="bg-white rounded-xl shadow-md border p-6 text-left hover:ring-2 hover:ring-green-600 transition focus:outline-none"
                  onClick={() => setSelectedTeam(t)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {shieldSrc && (
                      <img
                        src={shieldSrc}
                        alt={`Escudo de ${t.nome || t.name}`}
                        className="w-10 h-10 rounded-full border object-cover"
                      />
                    )}
                    <div>
                      <h2 className="font-bold text-lg text-gray-900 mb-1">
                        {t.nome || t.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {t.description || "Sem descrição cadastrada"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Jogadores:{" "}
                    {t.member_count ??
                      (Array.isArray(t.members) ? t.members.length : 0)}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-4">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (loadingStats || !teamStats) {
    return (
      <div className="max-w-6xl mx-auto px-8 pt-8 pb-4">
        <button
          type="button"
          className="text-sm text-green-700 mb-4 underline"
          onClick={() => {
            setSelectedTeam(null);
            setTeamStats(null);
          }}
        >
          &larr; Voltar para seleção de times
        </button>
        <div className="text-gray-500">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 pt-8 pb-4">
      <button
        type="button"
        className="text-sm text-green-700 mb-4 underline"
        onClick={() => {
          setSelectedTeam(null);
          setTeamStats(null);
        }}
      >
        &larr; Voltar para seleção de times
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Estatísticas do Time
      </h1>
      <p className="text-gray-600 mb-2">
        Visão detalhada do {teamStats.teamName} durante o campeonato.
      </p>
      {error && (
        <p className="text-sm text-red-500 mb-4">
          {error}
        </p>
      )}

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
                {
                  label: "Vitórias",
                  data: teamStats.winsPerMonth,
                  backgroundColor: green,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
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
                  {
                    label: "Jogadores",
                    data: pieDetail.players,
                    backgroundColor: greenPalette,
                  },
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
        <h2 className="font-bold text-lg mb-4">
          Estatísticas Individuais dos Jogadores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {playerDetails.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-full">
              Nenhuma estatística registrada para este time ainda.
            </p>
          ) : (
            playerDetails.map((player) => (
              <PlayerStatCard key={player.id} player={player} />
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-lg mb-4 text-black">
          Alertas e Notificações
        </h2>
        <div className="space-y-4">
          {alerts.length === 0 && (
            <p className="italic text-gray-600">
              Sem notificações no momento.
            </p>
          )}
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-red-500 hover:bg-red-400 flex items-center gap-2 p-3 rounded border border-red-300 bg-red-50"
            >
              <MdWarning className="w-5 h-5 text-red-900" />
              <span className="font-semibold text-white">
                {alert.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
