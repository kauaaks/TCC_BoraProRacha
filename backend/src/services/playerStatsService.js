// src/services/playerStatsService.js
const mongoose = require("mongoose");
const User = require("../models/user");
const Times = require("../models/teams");
const Jogos = require("../models/games");
const GameStats = require("../models/game_stats");

// helper para agrupar por mês (1-12)
function initMonths() {
  return Array.from({ length: 12 }, () => 0);
}

async function getPlayerStats(firebaseUid) {
  if (!firebaseUid) {
    throw new Error("UID do jogador ausente.");
  }

  // perfil básico
  const user = await User.findOne({ firebaseUid }).lean();
  if (!user) throw new Error("Jogador não encontrado.");

  // pega primeiro time onde ele está como jogador ou representante
  const team = await Times.findOne({
    "members.uid": firebaseUid,
  }).lean();

  const teamId = team?._id || null;

  // todas as stats desse jogador
  const statsDocs = await GameStats.find({ firebaseUid }).lean();
  const matches = statsDocs.length;

  let golsTotal = 0;
  let assistsTotal = 0;
  const golsPorMes = initMonths();
  const assistsPorMes = initMonths();

  let gameIds = [];

  if (statsDocs.length) {
    gameIds = statsDocs.map((s) => s.game_id);

    // carregar jogos para pegar mês, adversário e resultado
    const games = await Jogos.find({ _id: { $in: gameIds } }).lean();
    const gameById = new Map(games.map((g) => [String(g._id), g]));

    statsDocs.forEach((s) => {
      const g = gameById.get(String(s.game_id));
      if (!g) return;

      golsTotal += s.goals || 0;
      assistsTotal += s.assists || 0;

      const d = new Date(g.scheduled_date);
      const monthIndex = d.getMonth(); // 0-11

      golsPorMes[monthIndex] += s.goals || 0;
      assistsPorMes[monthIndex] += s.assists || 0;
    });
  }

  // últimos jogos (ordena por data do jogo)
  let recentGames = [];
  if (gameIds.length) {
    const games = await Jogos.find({ _id: { $in: gameIds } })
      .sort({ scheduled_date: -1 })
      .limit(5)
      .lean();

    const gamesById = new Map(games.map((g) => [String(g._id), g]));

    // carregar times para saber adversário
    const allTeamIds = Array.from(
      new Set(
        games.flatMap((g) => (g.teams_id || []).map((id) => String(id)))
      )
    );
    const teamsDocs = await Times.find({ _id: { $in: allTeamIds } }).lean();
    const teamNameById = new Map(
      teamsDocs.map((t) => [String(t._id), t.nome || t.name || "Time"])
    );

    recentGames = statsDocs
      .map((s) => {
        const g = gamesById.get(String(s.game_id));
        if (!g) return null;

        const isTeam1 = teamId && String(g.teams_id[0]) === String(teamId);
        const team1Id = g.teams_id[0];
        const team2Id = g.teams_id[1];

        const goals1 = g.goals_team1 ?? 0;
        const goals2 = g.goals_team2 ?? 0;

        let result = "Empate";
        if (g.winner_team_id) {
          if (String(g.winner_team_id) === String(teamId)) result = "Vitória";
          else result = "Derrota";
        }

        const opponentId =
          String(team1Id) === String(teamId) ? team2Id : team1Id;
        const opponentName =
          teamNameById.get(String(opponentId)) || "Adversário";

        const score = isTeam1 ? `${goals1}x${goals2}` : `${goals2}x${goals1}`;

        return {
          id: String(g._id),
          opponent: opponentName,
          result,
          score,
          gols: s.goals || 0,
          assists: s.assists || 0,
          date: g.scheduled_date,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }

  // ranking de gols no time
  let ranking = [];
  if (teamId) {
    const teamGames = await Jogos.find({
      teams_id: teamId,
      status: { $ne: "cancelado" },
    }).lean();

    const teamGameIds = teamGames.map((g) => g._id);

    const teamStats = await GameStats.find({
      game_id: { $in: teamGameIds },
    }).lean();

    const golsByUid = new Map();
    teamStats.forEach((s) => {
      const uid = s.firebaseUid;
      golsByUid.set(uid, (golsByUid.get(uid) || 0) + (s.goals || 0));
    });

    const users = await User.find({
      firebaseUid: { $in: Array.from(golsByUid.keys()) },
    }).lean();

    const nameByUid = new Map(
      users.map((u) => [u.firebaseUid, u.nome || "Jogador"])
    );

    ranking = Array.from(golsByUid.entries())
      .map(([uid, gols]) => ({
        uid,
        name: nameByUid.get(uid) || "Jogador",
        gols,
      }))
      .sort((a, b) => b.gols - a.gols);
  }

  return {
    profile: {
      name: user.nome,
      avatar: null,
      position:
        team?.members?.find((m) => m.uid === firebaseUid)?.position ||
        "Atacante",
      age: 22, // você pode trocar quando tiver birthDate
      status: user.ativo ? "Ativo" : "Inativo",
    },
    stats: {
      matches,
      gols: golsTotal,
      assists: assistsTotal,
    },
    golsPorMes,
    assistsPorMes,
    recentGames,
    ranking,
    alerts: [],
    awards: [],
  };
}

module.exports = {
  getPlayerStats,
};
