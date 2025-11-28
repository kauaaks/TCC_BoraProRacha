import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Shirt, Loader2, ArrowLeft, X, Trophy } from "lucide-react";

function formatDateLabel(date, time) {
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
}

function TournamentBracket({ tournament, squads, userUid }) {
  if (!tournament || !tournament.matches || tournament.matches.length === 0) {
    return null;
  }

  const rounds = {
    quartas: tournament.matches.filter(m => m.round === "quartas"),
    semis: tournament.matches.filter(m => m.round === "semis"),
    final: tournament.matches.filter(m => m.round === "final"),
    terceiro_lugar: tournament.matches.filter(m => m.round === "terceiro_lugar"),
  };

  const hasQuartas = rounds.quartas.length > 0;

  const getSquadByIndex = (index) => {
    return squads[index];
  };

  const isUserInSquad = (squadIndex) => {
    const squad = getSquadByIndex(squadIndex);
    if (!squad) return false;
    return squad.players.some(p => p.id === userUid || p.uid === userUid);
  };

  const MatchCard = ({ match }) => {
    const team1 = match.team1;
    const team2 = match.team2;
    const isTeam1User = isUserInSquad(team1.squadIndex);
    const isTeam2User = isUserInSquad(team2.squadIndex);

    return (
      <div className="border rounded-lg p-3 bg-white shadow-sm min-w-[200px]">
        <div className="text-xs text-gray-500 text-center mb-2 font-semibold">
          {match.round === "semis" && "Semifinal"}
          {match.round === "quartas" && "Quartas"}
          {match.round === "final" && "Final"}
          {match.round === "terceiro_lugar" && "3º Lugar"}
        </div>
        
        <div className={`flex items-center justify-between p-2 rounded ${
          isTeam1User ? "bg-green-50 border border-green-200" : "bg-gray-50"
        } ${match.winner_squadIndex === team1.squadIndex ? "font-bold" : ""}`}>
          <span className="text-sm truncate">{team1.name}</span>
          {match.played && (
            <span className="text-sm font-bold ml-2">{match.goals_team1 ?? "-"}</span>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 my-1">vs</div>

        <div className={`flex items-center justify-between p-2 rounded ${
          isTeam2User ? "bg-green-50 border border-green-200" : "bg-gray-50"
        } ${match.winner_squadIndex === team2.squadIndex ? "font-bold" : ""}`}>
          <span className="text-sm truncate">{team2.name}</span>
          {match.played && (
            <span className="text-sm font-bold ml-2">{match.goals_team2 ?? "-"}</span>
          )}
        </div>

        {!match.played && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500 italic">A definir</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-600" />
        Mini-Torneio Eliminatório
      </h3>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 items-start min-w-max">
          {hasQuartas && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-700 text-center">Quartas</div>
              {rounds.quartas.map((match, idx) => (
                <MatchCard key={idx} match={match} />
              ))}
            </div>
          )}

          {rounds.semis.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-700 text-center">Semifinais</div>
              {rounds.semis.map((match, idx) => (
                <MatchCard key={idx} match={match} />
              ))}
            </div>
          )}

          <div className="space-y-4">
            {rounds.final.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 text-center mb-2">Final</div>
                {rounds.final.map((match, idx) => (
                  <MatchCard key={idx} match={match} />
                ))}
              </div>
            )}
            {rounds.terceiro_lugar.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-700 text-center mb-2">3º Lugar</div>
                {rounds.terceiro_lugar.map((match, idx) => (
                  <MatchCard key={idx} match={match} />
                ))}
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
              {getSquadByIndex(tournament.champion_squadIndex)?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamesJogador() {
  const { user, apiCall } = useAuth();

  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailGame, setDetailGame] = useState(null);

  const fullName = useMemo(
    () => (user?.nome || user?.displayName || user?.name || "").trim(),
    [user]
  );
  const firstName = useMemo(
    () => (fullName ? fullName.split(" ")[0] : ""),
    [fullName]
  );

  const userUid = user?.uid || user?._id;

  useEffect(() => {
    loadMyTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamGames(selectedTeam);
    }
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
              playersCount: members.length
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
    } finally {
      setLoading(false);
    }
  };

  const loadTeamGames = async (teamId) => {
    try {
      setLoading(true);

      const gamesData = await apiCall(`/panelao/teams/${teamId}`);
      
      const processedGames = (gamesData || [])
        .map(game => {
          let mySquad = null;
          if (game.squads && Array.isArray(game.squads)) {
            mySquad = game.squads.find(squad => 
              squad.players.some(player => 
                player.id === userUid || player.uid === userUid
              )
            );
          }

          const scheduledDate = new Date(game.scheduled_date);
          return {
            ...game,
            mySquad,
            date: scheduledDate.toISOString().split('T')[0],
            time: scheduledDate.toTimeString().substring(0, 5),
          };
        })
        .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

      setGames(processedGames);
    } catch (error) {
      console.error("Erro ao carregar jogos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setGames([]);
  };

  const openDetailModal = (game) => {
    setDetailGame(game);
  };

  const closeDetailModal = () => {
    setDetailGame(null);
  };

  const proximosJogos = useMemo(() => {
    return games.filter(g => g.status !== "terminado");
  }, [games]);

  const jogosAnteriores = useMemo(() => {
    return games.filter(g => g.status === "terminado");
  }, [games]);

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
          <h1 className="text-3xl font-bold text-gray-900">Meus Jogos</h1>
          <p className="text-gray-600">
            Você ainda não faz parte de nenhum time. Entre em um time para ver seus jogos.
          </p>
        </header>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Peça ao representante do seu time para te adicionar como jogador.
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
          <h1 className="text-3xl font-bold text-gray-900">Meus Jogos</h1>
          <p className="text-gray-600">
            Olá {firstName || "jogador"}, selecione um time para ver seus jogos e panelas.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTeams.map((team) => {
            const id = String(team._id || team.id);
            const playersCount = team.playersCount || team.players?.length || 0;
            
            return (
              <div
                key={id}
                className="p-4 rounded-lg border bg-white flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-appsociety-green transition"
                onClick={() => setSelectedTeam(id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-appsociety-green flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{team.nome || team.name}</div>
                    <div className="text-xs text-gray-500">
                      {playersCount} {playersCount === 1 ? 'jogador' : 'jogadores'}
                    </div>
                  </div>
                </div>
                <div className="text-appsociety-green">
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
          {currentTeam?.nome || currentTeam?.name || "Meus Jogos"}
        </h1>
        <p className="text-gray-600">
          {firstName || "Jogador"}, veja seus próximos jogos, horário, local e a que panela você pertence.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Próximos jogos</CardTitle>
          <CardDescription>Jogos em que você está inscrito como jogador.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-appsociety-green" />
            </div>
          ) : proximosJogos.length === 0 ? (
            <p className="text-sm text-gray-500">
              Você ainda não tem jogos agendados. Aguarde seu representante marcar a próxima pelada.
            </p>
          ) : (
            <div className="space-y-4">
              {proximosJogos.map((game) => (
                <Card 
                  key={game._id || game.id} 
                  className="border rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition"
                  onClick={() => openDetailModal(game)}
                >
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold">
                          <Calendar className="w-4 h-4 text-green-700" />
                          <span>{formatDateLabel(game.date, game.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{game.place || "A definir"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <StatusBadgePlayer status={game.status} />
                        {game.mySquad ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Sua panela:</span>
                            <span 
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                game.mySquad.color?.badge || "bg-green-100 text-green-800"
                              }`}
                            >
                              <Shirt className="w-3 h-3" />
                              {game.mySquad.name || "Seu time"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Sorteio ainda não realizado.
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jogos anteriores</CardTitle>
          <CardDescription>Resumo dos últimos rachões.</CardDescription>
        </CardHeader>
        <CardContent>
          {jogosAnteriores.length === 0 ? (
            <p className="text-sm text-gray-500">
              Você ainda não tem jogos finalizados.
            </p>
          ) : (
            <div className="space-y-3">
              {jogosAnteriores.map((game) => (
                <div
                  key={game._id || game.id}
                  className="border rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => openDetailModal(game)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                        <Calendar className="w-3 h-3" />
                        {formatDateLabel(game.date, game.time)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {game.place}
                      </div>
                    </div>
                    {game.mySquad && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                        {game.mySquad.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {detailGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl border-0 p-6 relative bg-white">
            <button
              type="button"
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={closeDetailModal}
            >
              <X className="w-5 h-5" />
            </button>

            <header className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {detailGame.status === "terminado" ? "Resultado do Jogo" : "Detalhes do Jogo"}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDateLabel(detailGame.date, detailGame.time)} •{" "}
                <MapPin className="w-4 h-4" />
                {detailGame.place}
              </p>
            </header>

            
            {detailGame.status === "terminado" && !detailGame.tournament && detailGame.squads?.length === 2 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                {detailGame.goals_team1 != null && detailGame.goals_team2 != null ? (
                  <>
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">{detailGame.squads[0]?.name}</div>
                        <div className="text-3xl font-bold text-gray-900">{detailGame.goals_team1}</div>
                      </div>
                      <div className="text-2xl text-gray-400">×</div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">{detailGame.squads[1]?.name}</div>
                        <div className="text-3xl font-bold text-gray-900">{detailGame.goals_team2}</div>
                      </div>
                    </div>
                    {detailGame.winner_squad_index != null && (
                      <div className="text-center mt-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                          <Trophy className="w-4 h-4" />
                          Vencedor: {detailGame.squads[detailGame.winner_squad_index]?.name}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 text-sm">
                    Placar ainda não registrado
                  </div>
                )}
              </div>
            )}

            {detailGame.tournament && detailGame.squads ? (
              <TournamentBracket 
                tournament={detailGame.tournament} 
                squads={detailGame.squads}
                userUid={userUid}
              />
            ) : detailGame.squads && detailGame.squads.length > 0 ? (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Panelas ({detailGame.squads.length} times)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {detailGame.squads.map((squad, idx) => {
                    const isMySquad = squad.players.some(p => 
                      p.id === userUid || p.uid === userUid
                    );
                    
                    return (
                      <div
                        key={idx}
                        className={`border rounded-xl overflow-hidden shadow-sm ${
                          isMySquad ? "ring-2 ring-appsociety-green" : ""
                        }`}
                      >
                        <div
                          className={`${squad.color?.class || "bg-gray-600"} text-white px-3 py-2 flex items-center justify-between`}
                        >
                          <span className="font-semibold">{squad.name}</span>
                          <span className="text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {squad.players.length}
                          </span>
                        </div>
                        <div className="p-3 space-y-1 text-sm">
                          {squad.players.map((p) => {
                            const isMe = p.id === userUid || p.uid === userUid;
                            return (
                              <div 
                                key={p.id} 
                                className={`flex items-center justify-between ${
                                  isMe ? "font-semibold text-appsociety-green" : ""
                                }`}
                              >
                                <span>{p.name} {isMe && "(Você)"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="border border-dashed rounded-xl p-6 text-center text-gray-500 text-sm">
                Sorteio ainda não realizado.
              </div>
            )}

            {detailGame.note && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Observações:</div>
                <div className="text-sm text-gray-800">{detailGame.note}</div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function StatusBadgePlayer({ status }) {
  if (status === "sorteio_realizado") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Panelas definidas
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
      Sorteio pendente
    </span>
  );
}
