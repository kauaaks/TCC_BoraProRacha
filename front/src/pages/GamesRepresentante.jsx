import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Plus,
  Shuffle,
  Users,
  MapPin,
  X,
  Loader2,
  ArrowLeft,
  Trophy,
  Edit,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

  const toAbsolute = (u) =>
  u?.startsWith?.("http") ? u : `${API_BASE_URL}${u || ""}`;

const teamColors = [
  { name: "Verde", class: "bg-green-600", badge: "bg-green-100 text-green-800" },
  { name: "Azul", class: "bg-blue-600", badge: "bg-blue-100 text-blue-800" },
  { name: "Amarelo", class: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-800" },
  { name: "Vermelho", class: "bg-red-600", badge: "bg-red-100 text-red-800" },
  { name: "Roxo", class: "bg-purple-600", badge: "bg-purple-100 text-purple-800" },
  { name: "Laranja", class: "bg-orange-500", badge: "bg-orange-100 text-orange-800" },
];


function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function TournamentBracketAdmin({ tournament, squads, onEditMatch, isFinalized }) {
  if (!tournament || !Array.isArray(tournament.matches) || tournament.matches.length === 0) {
    return null;
  }

  const rounds = {
    pre: tournament.matches.filter((m) => m.round === "pre"),
    quartas: tournament.matches.filter((m) => m.round === "quartas"),
    semis: tournament.matches.filter((m) => m.round === "semis"),
    final: tournament.matches.filter((m) => m.round === "final"),
    terceiro_lugar: tournament.matches.filter((m) => m.round === "terceiro_lugar"),
  };

  const hasPre = rounds.pre.length > 0;
  const hasQuartas = rounds.quartas.length > 0;

  const MatchCard = ({ match, matchIndex }) => {
    const team1 = match.team1;
    const team2 = match.team2;

    return (
      <div className="border rounded-lg p-3 bg-white shadow-sm min-w-[220px]">
        <div className="text-xs text-gray-500 text-center mb-2 font-semibold flex items-center justify-between">
          <span>
            {match.round === "pre" && "Pré-jogo"}
            {match.round === "quartas" && "Quartas"}
            {match.round === "semis" && "Semifinal"}
            {match.round === "final" && "Final"}
            {match.round === "terceiro_lugar" && "3º Lugar"}
          </span>
          {match.played && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Finalizada
            </span>
          )}
        </div>

        <div
          className={`flex items-center justify-between p-2 rounded bg-gray-50 ${
            match.winner_squadIndex === team1.squadIndex ? "font-bold ring-2 ring-yellow-400" : ""
          }`}
        >
          <span className="text-sm truncate">{team1.name}</span>
          {match.played && (
            <span className="text-sm font-bold ml-2">{match.goals_team1 ?? 0}</span>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 my-1">vs</div>

        <div
          className={`flex items-center justify-between p-2 rounded bg-gray-50 ${
            match.winner_squadIndex === team2.squadIndex ? "font-bold ring-2 ring-yellow-400" : ""
          }`}
        >
          <span className="text-sm truncate">{team2.name}</span>
          {match.played && (
            <span className="text-sm font-bold ml-2">{match.goals_team2 ?? 0}</span>
          )}
        </div>

        {!isFinalized && (
          <div className="text-center mt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs w-full"
              onClick={() => onEditMatch(matchIndex, match)}
            >
              <Edit className="w-3 h-3 mr-1" />
              {match.played ? "Editar Resultado" : "Registrar Resultado"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderColumn = (list) =>
    list.map((match) => {
      const matchIndex = tournament.matches.indexOf(match);
      return <MatchCard key={matchIndex} match={match} matchIndex={matchIndex} />;
    });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-600" />
        Mini-Torneio Eliminatório
      </h3>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 items-start min-w-max">
          {hasPre && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-700 text-center">
                Pré-jogo
              </div>
              {renderColumn(rounds.pre)}
            </div>
          )}

          {hasQuartas && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-700 text-center">
                Quartas
              </div>
              {renderColumn(rounds.quartas)}
            </div>
          )}

          {rounds.semis.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-700 text-center">
                Semifinais
              </div>
              {renderColumn(rounds.semis)}
            </div>
          )}

          <div className="space-y-4">
            {rounds.final.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 text-center mb-2">
                  Final
                </div>
                {renderColumn(rounds.final)}
              </div>
            )}
            {rounds.terceiro_lugar.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-700 text-center mb-2">
                  3º Lugar
                </div>
                {renderColumn(rounds.terceiro_lugar)}
              </div>
            )}
          </div>
        </div>
      </div>

      {tournament.champion_squadIndex != null && (
        <div className="border-t pt-4 mt-4">
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <span className="text-lg font-bold text-gray-900">Campeão</span>
            </div>
            <div className="text-xl font-bold text-yellow-700">
              {squads[tournament.champion_squadIndex]?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default function GamesRepresentante() {
  const { user, apiCall } = useAuth();

  const [games, setGames] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [sortModalGame, setSortModalGame] = useState(null);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [activeTab, setActiveTab] = useState("proximos");

  const [scoreModal, setScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({
    goals_team1: "",
    goals_team2: "",
    winner_squad_index: null,
  });

  const [tournamentMatchModal, setTournamentMatchModal] = useState(false);
  const [tournamentMatchData, setTournamentMatchData] = useState({
    matchIndex: null,
    match: null,
    goals_team1: "",
    goals_team2: "",
  });

  const [newGame, setNewGame] = useState({
    date: "",
    time: "",
    place: "",
    teamsCount: "2",
    note: "",
  });

  const fullName = useMemo(
    () => (user?.nome || user?.displayName || user?.name || "").trim(),
    [user]
  );
  const firstName = useMemo(
    () => (fullName ? fullName.split(" ")[0] : ""),
    [fullName]
  );

  const proximosJogos = useMemo(
    () => games.filter((g) => g.status !== "terminado"),
    [games]
  );
  const finalizadosJogos = useMemo(
    () => games.filter((g) => g.status === "terminado"),
    [games]
  );

  useEffect(() => {
    loadMyTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) loadTeamData(selectedTeam);
  }, [selectedTeam]);

  const loadMyTeams = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/teams/meustimes");
      const data = response?.teams || response || [];

      const teamsWithPlayers = await Promise.all(
        data.map(async (team) => {
          try {
            const teamData = await apiCall(`/teams/${team._id || team.id}`);
            const members = teamData?.members || [];
            return {
              ...team,
              players: members,
              playersCount: members.length,
            };
          } catch (error) {
            console.error(`Erro ao buscar membros do time ${team._id}:`, error);
            return { ...team, players: [], playersCount: 0 };
          }
        })
      );

      setMyTeams(teamsWithPlayers);
    } catch (error) {
      console.error("Erro ao carregar times:", error);
      alert("Erro ao carregar seus times");
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async (teamId) => {
    try {
      setLoading(true);

      const teamData = await apiCall(`/teams/${teamId}`);
      const members = teamData?.members || [];

      const playersWithNames = await Promise.all(
        members.map(async (member) => {
          try {
            const userData = await apiCall(`/users/firebase/${member.uid}`);
            return {
              ...member,
              _id: member.uid,
              name: userData?.nome || userData?.name || "Jogador",
              nome: userData?.nome || userData?.name || "Jogador",
            };
          } catch {
            return { ...member, _id: member.uid, name: "Jogador", nome: "Jogador" };
          }
        })
      );

      setTeamPlayers(playersWithNames);

      const gamesData = await apiCall(`/panelao/teams/${teamId}`);

      
      const formattedGames = (gamesData || []).map((game) => {
        const scheduledDate = new Date(game.scheduled_date);
        return {
          ...game,
          date: scheduledDate.toISOString().split("T")[0],
          time: scheduledDate.toTimeString().substring(0, 5),
          teamsCount: game.squads?.length || game.n_times || game.teamsCount || 2,
          place: game.place || "A definir",
          status: game.status || "sorteio_pendente",
        };
      });

      setGames(formattedGames);
    } catch (error) {
      console.error("Erro ao carregar dados do time:", error);
      alert("Erro ao carregar dados do time");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async (e) => {
  e.preventDefault();
  if (!newGame.date || !newGame.time || !newGame.place || !newGame.teamsCount) {
    alert("Preencha data, horário, local e quantidade de times.");
    return;
  }
  if (!selectedTeam) {
    alert("Selecione um time primeiro");
    return;
  }

  try {
    setSubmitting(true);
    
    const dateStr = `${newGame.date}T${newGame.time}:00`;
    const scheduledDate = new Date(dateStr);
    
    if (isNaN(scheduledDate.getTime())) {
      throw new Error("Data/horário inválido");
    }
    
    const scheduled_date = scheduledDate.toISOString();

    const gameData = {
      scheduled_date,  
      duration: 90,
      nTimes: Number(newGame.teamsCount),    
      is_tournament: ["3", "4", "5", "6"].includes(newGame.teamsCount),
      place: newGame.place,
      note: newGame.note
    };

    console.log('[FRONTEND] Enviando payload:', gameData);

    const createdGame = await apiCall(`/panelao/teams/${selectedTeam}`, {
      method: "POST",
      body: JSON.stringify(gameData),
    });

    const gameScheduledDate = new Date(createdGame.scheduled_date);
    const formattedGame = {
      ...createdGame,
      date: gameScheduledDate.toISOString().split("T")[0],
      time: gameScheduledDate.toTimeString().substring(0, 5),
      teamsCount: Number(newGame.teamsCount),
      place: createdGame.place || newGame.place,
      status: createdGame.status || "sorteio_pendente",
      tournament: createdGame.tournament
    };

    setGames((prev) => [formattedGame, ...prev]);
    setNewGame({ date: "", time: "", place: "", teamsCount: "2", note: "" });
    setCreateOpen(false);
    alert("Jogo agendado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar jogo:", error);
    alert(error?.message || "Erro ao agendar jogo");
  } finally {
    setSubmitting(false);
  }
};

  const openSortModal = async (game) => {
    try {
      setLoading(true);

      const fullGame = await apiCall(`/panelao/${game._id || game.id}`);

      setSortModalGame({
        ...fullGame,
        status: fullGame.status || "sorteio_pendente",
        squads:
          Array.isArray(fullGame.squads) && fullGame.squads.length > 0
            ? fullGame.squads
            : null,
        tournament: fullGame.tournament || null,
        teamsCount: fullGame.squads?.length || fullGame.n_times || fullGame.teamsCount || 2,
      });
    } catch (err) {
      console.error("Erro ao carregar jogo:", err);
      alert("Erro ao carregar dados do jogo");
    } finally {
      setLoading(false);
    }
  };

  const closeSortModal = () => setSortModalGame(null);

  const handleSortSquads = async () => {
    if (!sortModalGame) return;

    const teamsCount = sortModalGame.teamsCount || 2;
    if (teamPlayers.length === 0) {
      alert("Nenhum jogador disponível para sortear");
      return;
    }

    const shuffled = shuffleArray(teamPlayers);
    const squads = [];

    for (let i = 0; i < teamsCount; i++) {
      const color = teamColors[i % teamColors.length];
      squads.push({
        name: `Time ${color.name}`,
        color,
        players: [],
      });
    }

    let t = 0;
    for (const p of shuffled) {
      squads[t].players.push({
        id: p.uid || p._id,
        name: p.name || p.nome || "Jogador",
      });
      t = (t + 1) % teamsCount;
    }

    try {
      setSubmitting(true);

      const updatedGame = await apiCall(`/panelao/${sortModalGame._id}/draw`, {
        method: "PATCH",
        body: JSON.stringify({ squads }),
      });

      const updated = games.map((g) =>
        g._id === sortModalGame._id || g.id === sortModalGame.id
          ? {
              ...g,
              squads: updatedGame.squads,
              status: "sorteio_realizado",
              tournament: updatedGame.tournament,
              teamsCount: updatedGame.squads.length,
            }
          : g
      );
      setGames(updated);
      setSortModalGame((prev) =>
        prev && {
          ...prev,
          squads: updatedGame.squads,
          status: "sorteio_realizado",
          tournament: updatedGame.tournament,
          teamsCount: updatedGame.squads.length,
        }
      );

      alert("Sorteio salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar sorteio:", error);
      alert("Erro ao salvar sorteio: " + (error?.message || "Erro desconhecido"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenScoreModal = () => {
    if (!sortModalGame || !sortModalGame.squads || sortModalGame.squads.length !== 2) {
      alert("Sorteio deve ter 2 times para registrar placar simples");
      return;
    }

    if (sortModalGame.goals_team1 != null) {
      setScoreData({
        goals_team1: String(sortModalGame.goals_team1),
        goals_team2: String(sortModalGame.goals_team2),
        winner_squad_index: sortModalGame.winner_squad_index,
      });
    } else {
      setScoreData({
        goals_team1: "",
        goals_team2: "",
        winner_squad_index: null,
      });
    }

    setScoreModal(true);
  };

  const handleSaveScore = async () => {
    if (!sortModalGame) return;

    const g1 = Number(scoreData.goals_team1);
    const g2 = Number(scoreData.goals_team2);

    if (isNaN(g1) || isNaN(g2) || g1 < 0 || g2 < 0) {
      alert("Informe gols válidos para ambos os times");
      return;
    }

    try {
      setSubmitting(true);

      let winner_squad_index = null;
      if (g1 > g2) winner_squad_index = 0;
      else if (g2 > g1) winner_squad_index = 1;

      await apiCall(`/panelao/${sortModalGame._id}/score`, {
        method: "PATCH",
        body: JSON.stringify({
          goals_team1: g1,
          goals_team2: g2,
          winner_squad_index,
        }),
      });

      const updated = games.map((g) =>
        g._id === sortModalGame._id || g.id === sortModalGame.id
          ? { ...g, goals_team1: g1, goals_team2: g2, winner_squad_index }
          : g
      );
      setGames(updated);
      setSortModalGame((prev) =>
        prev && { ...prev, goals_team1: g1, goals_team2: g2, winner_squad_index }
      );

      setScoreModal(false);
      alert("Placar registrado com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar placar:", error);
      alert("Erro ao registrar placar: " + (error?.message || "Erro desconhecido"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTournamentMatch = (matchIndex, match) => {
    setTournamentMatchData({
      matchIndex,
      match,
      goals_team1: match.goals_team1 != null ? String(match.goals_team1) : "",
      goals_team2: match.goals_team2 != null ? String(match.goals_team2) : "",
    });
    setTournamentMatchModal(true);
  };

  const handleSaveTournamentMatch = async () => {
    if (!sortModalGame || tournamentMatchData.matchIndex == null) return;

    const g1 = Number(tournamentMatchData.goals_team1);
    const g2 = Number(tournamentMatchData.goals_team2);

    if (isNaN(g1) || isNaN(g2) || g1 < 0 || g2 < 0) {
      alert("Informe gols válidos para ambos os times");
      return;
    }

    try {
      setSubmitting(true);

      let winner_squadIndex = null;
      if (g1 > g2) winner_squadIndex = tournamentMatchData.match.team1.squadIndex;
      else if (g2 > g1) winner_squadIndex = tournamentMatchData.match.team2.squadIndex;

      const updatedGame = await apiCall(`/panelao/${sortModalGame._id}/tournament/match`, {
        method: "PATCH",
        body: JSON.stringify({
          matchIndex: tournamentMatchData.matchIndex,
          goals_team1: g1,
          goals_team2: g2,
          winner_squadIndex,
        }),
      });

      const updated = games.map((g) =>
        g._id === sortModalGame._id || g.id === sortModalGame.id
          ? { ...g, tournament: updatedGame.tournament }
          : g
      );
      setGames(updated);
      setSortModalGame((prev) => prev && { ...prev, tournament: updatedGame.tournament });

      setTournamentMatchModal(false);
      alert("Resultado da partida registrado com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar resultado:", error);
      alert("Erro ao registrar resultado: " + (error?.message || "Erro desconhecido"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishGame = () => {
    if (!sortModalGame) return;

    if (sortModalGame.tournament && sortModalGame.tournament.matches) {
      const allPlayed = sortModalGame.tournament.matches.every((m) => m.played);
      if (!allPlayed) {
        alert("Registre os resultados de todas as partidas antes de finalizar o torneio!");
        return;
      }
    }

    setConfirmFinish(true);
  };

  const confirmFinishGame = async () => {
  try {
    setSubmitting(true);
    setConfirmFinish(false);

    await apiCall(`/panelao/${sortModalGame._id}/finish`, {
      method: "PATCH",
    });

    const updated = games.map((g) =>
      g._id === sortModalGame._id || g.id === sortModalGame.id
        ? { ...g, status: "terminado" }
        : g
    );
    console.log("ANTES", games);
    console.log("DEPOIS", updated);

    setGames(updated);

    // mantém o objeto do modal sincronizado, caso você não feche
    setSortModalGame((prev) =>
      prev ? { ...prev, status: "terminado" } : prev
    );

    closeSortModal();
    // remove esta linha para não trocar de aba automaticamente
    // setActiveTab("finalizados");

    alert("Jogo finalizado com sucesso!");
  } catch (error) {
    console.error("Erro ao finalizar jogo:", error);
    alert("Erro ao finalizar jogo: " + (error?.message || "Erro desconhecido"));
  } finally {
    setSubmitting(false);
  }
};

  const formatDateLabel = (date, time) => {
    try {
      const d = new Date(`${date}T${time || "00:00"}`);
      return d.toLocaleString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return `${date} ${time}`;
    }
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setGames([]);
    setTeamPlayers([]);
    setActiveTab("proximos");
  };

  if (loading && myTeams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-appsociety-green" />
      </div>
    );
  }

  if (myTeams.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Jogos & Panelas</h1>
          <p className="text-gray-600">
            Organize seus jogos de Fut7 e sorteie as panelas de forma justa.
          </p>
        </header>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Você ainda não é representante de nenhum time. Crie ou entre em um time primeiro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="space-y-6 fade-in">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Jogos & Panelas</h1>
          <p className="text-gray-600">
            Olá {firstName || "representante"}, selecione um time para gerenciar os jogos e sorteios.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTeams.map((team) => {
              const id = String(team._id || team.id);
              const playersCount = team.playersCount || team.players?.length || 0;
              const shieldSrc = team.logo_url ? toAbsolute(team.logo_url) : null;

              return (
                <div
                  key={id}
                  className="p-4 rounded-lg border bg-white flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-appsociety-green transition"
                  onClick={() => setSelectedTeam(id)}
                >
                  <div className="flex items-center gap-3">
                    {shieldSrc ? (
                      <img
                        src={shieldSrc}
                        alt={`Escudo de ${team.nome || team.name}`}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-appsociety-green flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {team.nome || team.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {playersCount} {playersCount === 1 ? "jogador" : "jogadores"}
                      </div>
                    </div>
                  </div>
                  <div className="text-appsociety-green">
                    {/* seta que já existia */}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  const currentTeam = myTeams.find((t) => String(t._id || t.id) === String(selectedTeam));
  const displayGames = activeTab === "proximos" ? proximosJogos : finalizadosJogos;

  return (
    <div className="space-y-6 fade-in">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToTeams}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {currentTeam?.nome || currentTeam?.name || "Time"}
        </h1>
        <p className="text-gray-600">
          Organize seus jogos de Fut7 e sorteie as panelas de forma justa.
        </p>
      </header>

      <Card>
        <CardHeader className="w-full space-y-3">
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Jogos</CardTitle>
              <CardDescription>
                Agende novos jogos e faça o sorteio das panelas. ({teamPlayers.length} jogadores)
              </CardDescription>
            </div>
            <Button
              className="bg-appsociety-green hover:bg-green-600"
              onClick={() => setCreateOpen(true)}
              disabled={submitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar novo jogo
            </Button>
          </div>

          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "proximos"
                  ? "text-appsociety-green border-b-2 border-appsociety-green"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("proximos")}
            >
              Próximos ({proximosJogos.length})
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "finalizados"
                  ? "text-appsociety-green border-b-2 border-appsociety-green"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("finalizados")}
            >
              Finalizados ({finalizadosJogos.length})
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-appsociety-green" />
            </div>
          ) : displayGames.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {activeTab === "proximos"
                ? 'Nenhum jogo agendado ainda. Clique em "Agendar novo jogo" para começar.'
                : "Nenhum jogo finalizado ainda."}
            </p>
          ) : (
            <div className="space-y-3">
              {displayGames.map((game) => (
                <div
                  key={game._id || game.id}
                  className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold">
                      <Calendar className="w-4 h-4 text-green-700" />
                      <span>{formatDateLabel(game.date, game.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{game.place}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs md:text-sm mt-1">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Users className="w-3 h-3" />
                        {teamPlayers.length} jogadores
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Shuffle className="w-3 h-3" />
                        {game.teamsCount || 2} times
                      </span>
                      {game.tournament && game.teamsCount >= 3 && game.teamsCount <= 6 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Trophy className="w-3 h-3" />
                           Mini‑torneio ({game.teamsCount} {game.teamsCount === 1 ? "time" : "times"})
                        </span>
                      )}
                      {!game.tournament && game.teamsCount > 2 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Trophy className="w-3 h-3" />
                          Racha entre panelas
                        </span>
                      )}
                      <StatusBadge status={game.status} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {activeTab === "proximos" && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => openSortModal(game)}
                      >
                        <Shuffle className="w-4 h-4" />
                        {game.status === "sorteio_realizado" ? "Gerenciar" : "Sortear panelas"}
                      </Button>
                    )}
                    {activeTab === "finalizados" && game.squads && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => openSortModal(game)}
                      >
                        <Users className="w-4 h-4" />
                        Ver resultado
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg shadow-2xl border-0 p-6 relative bg-white">
            <button
              type="button"
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-1 text-gray-900">Agendar novo jogo</h2>
            <p className="text-sm text-gray-600 mb-4">
              Escolha data, horário e configuração das panelas.
            </p>

            <form className="space-y-4" onSubmit={handleCreateGame}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={newGame.date}
                    onChange={(e) => setNewGame((p) => ({ ...p, date: e.target.value }))}
                    className="h-11"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={newGame.time}
                    onChange={(e) => setNewGame((p) => ({ ...p, time: e.target.value }))}
                    className="h-11"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Local / Campo</Label>
                <Input
                  placeholder="Ex: Arena Society Central"
                  value={newGame.place}
                  onChange={(e) => setNewGame((p) => ({ ...p, place: e.target.value }))}
                  className="h-11"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Quantidade de times</Label>
                  <Select
                    value={newGame.teamsCount}
                    onValueChange={(v) => setNewGame((p) => ({ ...p, teamsCount: v }))}
                    disabled={submitting}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Escolha..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 times (Racha normal)</SelectItem>
                      <SelectItem value="3">3 times (Apenas panelas)</SelectItem>
                      <SelectItem value="4">4 times (Mini‑torneio)</SelectItem>
                      <SelectItem value="5">5 times (Apenas panelas)</SelectItem>
                      <SelectItem value="6">6 times (Apenas panelas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Observações (opcional)</Label>
                  <Input
                    placeholder="Ex: Trazer colete branco"
                    value={newGame.note}
                    onChange={(e) => setNewGame((p) => ({ ...p, note: e.target.value }))}
                    className="h-11"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-appsociety-green hover:bg-green-600 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Agendando...
                    </>
                  ) : (
                    "Confirmar agendamento"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {sortModalGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl border-0 p-6 relative bg-white">
            <button
              type="button"
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={closeSortModal}
            >
              <X className="w-5 h-5" />
            </button>

            <header className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {sortModalGame.status === "terminado" ? "Resultado do Jogo" : "Gerenciar Jogo"}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDateLabel(sortModalGame.date, sortModalGame.time)} •{" "}
                <MapPin className="w-4 h-4" />
                {sortModalGame.place} • {sortModalGame.teamsCount || 2} times
                {sortModalGame.tournament && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Trophy className="w-3 h-3" />
                    Mini‑torneio ({sortModalGame.teamsCount} {sortModalGame.teamsCount === 1 ? "time" : "times"})
                  </span>
                )}
              </p>
            </header>

            {!sortModalGame.tournament &&
              sortModalGame.squads?.length === 2 &&
              sortModalGame.status === "terminado" && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  {sortModalGame.goals_team1 != null && sortModalGame.goals_team2 != null ? (
                    <>
                      <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">
                            {sortModalGame.squads[0]?.name}
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {sortModalGame.goals_team1}
                          </div>
                        </div>
                        <div className="text-2xl text-gray-400">×</div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">
                            {sortModalGame.squads[1]?.name}
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {sortModalGame.goals_team2}
                          </div>
                        </div>
                      </div>
                      {sortModalGame.winner_squad_index != null && (
                        <div className="text-center mt-3">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                            <Trophy className="w-4 h-4" />
                            Vencedor:{" "}
                            {sortModalGame.squads[sortModalGame.winner_squad_index]?.name}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 text-sm">
                      Placar não foi registrado
                    </div>
                  )}
                </div>
              )}

            {sortModalGame.status !== "terminado" && (
              <section className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-1">
                  Jogadores disponíveis ({teamPlayers.length})
                </h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  {teamPlayers.map((p) => (
                    <span
                      key={p.uid || p._id}
                      className="px-2 py-1 rounded-full border text-gray-700 bg-gray-50"
                    >
                      {p.name || p.nome || "Jogador"}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {sortModalGame.status !== "terminado" && (
              <div className="border-t pt-4 mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-sm text-gray-600">
                  {sortModalGame.squads
                    ? sortModalGame.tournament && sortModalGame.teamsCount === 4
                      ? "Registre os resultados das partidas do mini‑torneio."
                      : "Panelas sorteadas. Você pode registrar o placar ou finalizar o jogo."
                    : 'Clique em "Sortear panelas" para distribuir os jogadores.'}
                </p>

                <div className="flex flex-wrap gap-2 justify-end">
                  {!sortModalGame.squads && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleSortSquads}
                      disabled={submitting}
                    >
                      <Shuffle className="w-4 h-4" />
                      Sortear panelas
                    </Button>
                  )}

                  {sortModalGame.squads && !sortModalGame.tournament && sortModalGame.teamsCount === 2 && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleOpenScoreModal}
                      disabled={submitting}
                    >
                      <Trophy className="w-4 h-4" />
                      Registrar placar
                    </Button>
                  )}

                  {sortModalGame.squads && sortModalGame.tournament && sortModalGame.teamsCount === 4 && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        // se quiser, pode abrir alguma ajuda/explicação aqui
                      }}
                      disabled={submitting}
                    >
                      <Trophy className="w-4 h-4" />
                      Gerenciar torneio
                    </Button>
                  )}

                  <Button
                    className="bg-appsociety-green hover:bg-green-600 text-white flex items-center gap-2"
                    onClick={handleFinishGame}
                    disabled={submitting || !sortModalGame.squads}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Finalizando...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4" />
                        Finalizar jogo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

                          {/* Panelas */}
          {sortModalGame.squads && sortModalGame.squads.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Panelas ({sortModalGame.squads.length} times)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortModalGame.squads.map((team, idx) => (
                  <div
                    key={idx}
                    className="border rounded-xl overflow-hidden bg-white shadow-sm"
                  >
                    <div
                      className={`${team.color.class} text-white px-3 py-2 flex items-center justify-between`}
                    >
                      <span className="font-semibold">{team.name}</span>
                      <span className="text-xs flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {team.players.length}
                      </span>
                    </div>
                    <div className="p-3 space-y-1 text-sm">
                      {team.players.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between"
                        >
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-dashed rounded-xl p-6 text-center text-gray-500 text-sm mt-6">
              Nenhum sorteio realizado ainda.
            </div>
          )}

          {/* Mini‑torneio */}
          {sortModalGame.tournament &&
            Array.isArray(sortModalGame.tournament.matches) &&
            sortModalGame.tournament.matches.length > 0 && (
              <div className="mt-8">
                <TournamentBracketAdmin
                  tournament={sortModalGame.tournament}
                  squads={sortModalGame.squads}
                  onEditMatch={handleEditTournamentMatch}
                  isFinalized={sortModalGame.status === "terminado"}
                />
              </div>
            )}
        </Card>
      </div>
    )}


      {scoreModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold mb-4">Registrar Placar</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    {sortModalGame?.squads?.[0]?.name || "Time 1"}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Gols"
                    value={scoreData.goals_team1}
                    onChange={(e) =>
                      setScoreData((prev) => ({ ...prev, goals_team1: e.target.value }))
                    }
                    className="h-16 text-center text-3xl font-bold"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    {sortModalGame?.squads?.[1]?.name || "Time 2"}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Gols"
                    value={scoreData.goals_team2}
                    onChange={(e) =>
                      setScoreData((prev) => ({ ...prev, goals_team2: e.target.value }))
                    }
                    className="h-16 text-center text-3xl font-bold"
                    disabled={submitting}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                O vencedor será determinado automaticamente
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setScoreModal(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSaveScore}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Placar"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tournamentMatchModal && tournamentMatchData.match && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold mb-4">
              Registrar Resultado -{" "}
              {tournamentMatchData.match.round === "semis"
                ? "Semifinal"
                : tournamentMatchData.match.round === "quartas"
                ? "Quartas"
                : tournamentMatchData.match.round === "final"
                ? "Final"
                : "3º Lugar"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    {tournamentMatchData.match.team1.name}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Gols"
                    value={tournamentMatchData.goals_team1}
                    onChange={(e) =>
                      setTournamentMatchData((prev) => ({
                        ...prev,
                        goals_team1: e.target.value,
                      }))
                    }
                    className="h-16 text-center text-3xl font-bold"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    {tournamentMatchData.match.team2.name}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Gols"
                    value={tournamentMatchData.goals_team2}
                    onChange={(e) =>
                      setTournamentMatchData((prev) => ({
                        ...prev,
                        goals_team2: e.target.value,
                      }))
                    }
                    className="h-16 text-center text-3xl font-bold"
                    disabled={submitting}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                O vencedor será determinado automaticamente
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setTournamentMatchModal(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSaveTournamentMatch}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Resultado"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {confirmFinish && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold mb-2">
              Finalizar {sortModalGame?.tournament ? "Torneio" : "Jogo"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja finalizar este{" "}
              {sortModalGame?.tournament ? "torneio" : "jogo"}? Ele será movido para a aba de
              finalizados.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmFinish(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmFinishGame}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  "Sim, finalizar"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "sorteio_realizado") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Em andamento
      </span>
    );
  }
  if (status === "terminado") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Finalizado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Aguardando sorteio
    </span>
  );
}
