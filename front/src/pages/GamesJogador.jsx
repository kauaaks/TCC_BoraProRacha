import React, { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // se não tiver, pode trocar por span com classes
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Shirt } from "lucide-react";

// Mesmo mock de jogos, mas agora com info de qual time o jogador caiu
const mockGamesForPlayer = [
  {
    id: 1,
    date: "2025-12-05",
    time: "20:00",
    place: "Arena Society Central",
    status: "sorteio_realizado",
    team: {
      name: "Time Verde",
      colorClass: "bg-green-600",
      badgeClass: "bg-green-100 text-green-800",
      mates: ["Pedro Santos", "Carlos Lima", "Lucas Souza", "Marcos Oliveira", "Rafael Costa"],
    },
  },
  {
    id: 2,
    date: "2025-11-30",
    time: "19:30",
    place: "Quadra Fut7 Zona Norte",
    status: "sorteio_pendente",
    team: null,
  },
];

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

export default function GamesJogador() {
  const { user } = useAuth();

  const fullName = useMemo(
    () => (user?.nome || user?.displayName || user?.name || "").trim(),
    [user]
  );
  const firstName = useMemo(
    () => (fullName ? fullName.split(" ")[0] : ""),
    [fullName]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Meus Jogos
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
          {mockGamesForPlayer.length === 0 ? (
            <p className="text-sm text-gray-500">
              Você ainda não tem jogos agendados. Aguarde seu representante marcar a próxima pelada.
            </p>
          ) : (
            <div className="space-y-4">
              {mockGamesForPlayer.map((game) => (
                <Card key={game.id} className="border rounded-xl shadow-sm">
                  <CardContent className="pt-4 space-y-3">
                    {/* Linha principal com data/local */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold">
                          <Calendar className="w-4 h-4 text-green-700" />
                          <span>{formatDateLabel(game.date, game.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{game.place}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <StatusBadgePlayer status={game.status} />
                        {game.team ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Sua panela:</span>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                              <Shirt className="w-3 h-3" />
                              {game.team.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Sorteio ainda não realizado.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lista de companheiros de time, se já tiver sorteio */}
                    {game.team && (
                      <div className="border-t pt-3 mt-2">
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                          <Users className="w-4 h-4" />
                          <span>Companheiros de time</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {game.team.mates.map((mate) => (
                            <span
                              key={mate}
                              className="px-2 py-1 rounded-full border text-gray-700 bg-gray-50"
                            >
                              {mate}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico simples (mock) */}
      <Card>
        <CardHeader>
          <CardTitle>Jogos anteriores</CardTitle>
          <CardDescription>Resumo rápido dos últimos rachões.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Em breve você poderá ver um histórico completo dos seus jogos, resultados e desempenho.
          </p>
        </CardContent>
      </Card>
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
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Sorteio pendente
    </span>
  );
}
