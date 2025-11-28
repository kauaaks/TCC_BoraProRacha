import React, { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Shuffle, Users, MapPin, Clock, X } from "lucide-react";

// Paleta baseada na sua aplicação
const teamColors = [
  { name: "Verde", class: "bg-green-600", badge: "bg-green-100 text-green-800" },
  { name: "Azul", class: "bg-blue-600", badge: "bg-blue-100 text-blue-800" },
  { name: "Amarelo", class: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-800" },
  { name: "Vermelho", class: "bg-red-600", badge: "bg-red-100 text-red-800" },
  { name: "Roxo", class: "bg-purple-600", badge: "bg-purple-100 text-purple-800" },
];

const mockPlayers = [
  { id: 1, name: "João Silva" },
  { id: 2, name: "Pedro Santos" },
  { id: 3, name: "Carlos Lima" },
  { id: 4, name: "Lucas Souza" },
  { id: 5, name: "Marcos Oliveira" },
  { id: 6, name: "Rafael Costa" },
  { id: 7, name: "Thiago Rocha" },
  { id: 8, name: "Gustavo Almeida" },
  { id: 9, name: "Bruno Pereira" },
  { id: 10, name: "Diego Matos" },
  { id: 11, name: "Fernando Ribeiro" },
  { id: 12, name: "Henrique Melo" },
  { id: 13, name: "Igor Nunes" },
  { id: 14, name: "Leo Fernandes" },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GamesRepresentante() {
  const { user } = useAuth();

  const [games, setGames] = useState([
    {
      id: 1,
      date: "2025-12-05",
      time: "20:00",
      place: "Arena Society Central",
      teamsCount: 4,
      status: "sorteio_pendente",
      squads: null, // será preenchido com o sorteio
    },
  ]);

  const [createOpen, setCreateOpen] = useState(false);
  const [sortModalGame, setSortModalGame] = useState(null);

  const [newGame, setNewGame] = useState({
    date: "",
    time: "",
    place: "",
    teamsCount: "4",
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

  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!newGame.date || !newGame.time || !newGame.place || !newGame.teamsCount) {
      alert("Preencha data, horário, local e quantidade de times.");
      return;
    }
    const id = games.length ? Math.max(...games.map((g) => g.id)) + 1 : 1;
    const game = {
      id,
      date: newGame.date,
      time: newGame.time,
      place: newGame.place,
      teamsCount: Number(newGame.teamsCount),
      note: newGame.note,
      status: "sorteio_pendente",
      squads: null,
    };
    setGames((prev) => [...prev, game]);
    setNewGame({ date: "", time: "", place: "", teamsCount: "4", note: "" });
    setCreateOpen(false);
  };

  const openSortModal = (game) => {
    setSortModalGame(game);
  };

  const closeSortModal = () => {
    setSortModalGame(null);
  };

  const handleSortSquads = () => {
    if (!sortModalGame) return;
    const teamsCount = sortModalGame.teamsCount || 2;
    const shuffled = shuffleArray(mockPlayers);
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
      squads[t].players.push(p);
      t = (t + 1) % teamsCount;
    }

    const updated = games.map((g) =>
      g.id === sortModalGame.id
        ? { ...g, squads, status: "sorteio_realizado" }
        : g
    );
    setGames(updated);
    setSortModalGame((prev) => prev && { ...prev, squads, status: "sorteio_realizado" });
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

  return (
    <div className="space-y-6 fade-in">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Jogos & Panelas
        </h1>
        <p className="text-gray-600">
          Olá {firstName || "representante"}, organize seus jogos de Fut7 e sorteie as panelas de forma justa.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Próximos jogos</CardTitle>
            <CardDescription>Agende novos jogos e faça o sorteio das panelas.</CardDescription>
          </div>
          <Button
            className="bg-appsociety-green hover:bg-green-600"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agendar novo jogo
          </Button>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum jogo agendado ainda. Clique em "Agendar novo jogo" para começar.
            </p>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <div
                  key={game.id}
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
                        {mockPlayers.length} jogadores mock
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Shuffle className="w-3 h-3" />
                        {game.teamsCount} times
                      </span>
                      <StatusBadge status={game.status} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => openSortModal(game)}
                    >
                      <Shuffle className="w-4 h-4" />
                      {game.status === "sorteio_realizado"
                        ? "Ver panelas"
                        : "Sortear panelas"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Agendar Jogo */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-lg shadow-2xl border-0 p-6 relative bg-white">
            <button
              type="button"
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setCreateOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-1 text-gray-900">
              Agendar novo jogo
            </h2>
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
                    />
                </div>

                <div className="space-y-1">
                    <Label>Horário</Label>
                    <Input
                    type="time"
                    value={newGame.time}
                    onChange={(e) => setNewGame((p) => ({ ...p, time: e.target.value }))}
                    className="h-11 rounded-lg border border-gray-300 bg-white text-gray-800
                                focus:outline-none focus:ring-2 focus:ring-appsociety-green focus:border-appsociety-green
                                [&::-webkit-calendar-picker-indicator]:opacity-70
                                [&::-webkit-calendar-picker-indicator]:hover:opacity-100
                                [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    required
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Quantidade de times</Label>
                  <Select
                    value={newGame.teamsCount}
                    onValueChange={(v) => setNewGame((p) => ({ ...p, teamsCount: v }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Escolha..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} times
                        </SelectItem>
                      ))}
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
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-appsociety-green hover:bg-green-600 text-white"
                >
                  Confirmar agendamento
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Sorteio Panelas */}
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
                Sorteio de panelas
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDateLabel(sortModalGame.date, sortModalGame.time)} •{" "}
                <MapPin className="w-4 h-4" />
                {sortModalGame.place} • {sortModalGame.teamsCount} times
              </p>
            </header>

            <section className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Jogadores disponíveis ({mockPlayers.length})
              </h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {mockPlayers.map((p) => (
                  <span
                    key={p.id}
                    className="px-2 py-1 rounded-full border text-gray-700 bg-gray-50"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </section>

            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Clique em "Sortear panelas" para distribuir os jogadores de forma aleatória entre os times.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleSortSquads}
                >
                  <Shuffle className="w-4 h-4" />
                  {sortModalGame.squads ? "Resortear" : "Sortear panelas"}
                </Button>
                {sortModalGame.squads && (
                  <Button className="bg-appsociety-green hover:bg-green-600 text-white">
                    Confirmar panelas
                  </Button>
                )}
              </div>
            </div>

            {sortModalGame.squads ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortModalGame.squads.map((team, idx) => (
                  <div
                    key={idx}
                    className="border rounded-xl overflow-hidden bg-white shadow-sm"
                  >
                    <div className={`${team.color.class} text-white px-3 py-2 flex items-center justify-between`}>
                      <span className="font-semibold">{team.name}</span>
                      <span className="text-xs flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {team.players.length}
                      </span>
                    </div>
                    <div className="p-3 space-y-1 text-sm">
                      {team.players.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed rounded-xl p-6 text-center text-gray-500 text-sm">
                Nenhum sorteio realizado ainda. Clique em{" "}
                <span className="font-semibold">"Sortear panelas"</span> para gerar os times.
              </div>
            )}
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
        Sorteio realizado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Sorteio pendente
    </span>
  );
}
