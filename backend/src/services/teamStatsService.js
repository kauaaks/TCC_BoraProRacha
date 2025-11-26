const mongoose = require("mongoose");
const Times = require("../models/teams");
const Jogos = require("../models/games");
const GameStats = require("../models/game_stats");
const User = require("../models/user");


function buildWinsByMonth(games, teamId) {
  const map = new Map(); 

  games.forEach(g => {
    if (!g.winner_team_id) return;
    if (String(g.winner_team_id) !== String(teamId)) return;

    const d = new Date(g.scheduled_date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12
    const key = `${year}-${month}`;

    if (!map.has(key)) {
      map.set(key, { year, month, wins: 0 });
    }
    map.get(key).wins += 1;
  });

  return Array.from(map.values())
    .sort((a, b) =>
      a.year === b.year ? a.month - b.month : a.year - b.year
    );
}

async function getTeamStats(teamId) {
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("ID de time inválido.");
  }

  const team = await Times.findById(teamId).lean();
  if (!team) {
    throw new Error("Time não encontrado.");
  }

  const playerMembers = (team.members || []).filter(
  (m) => m.user_type === "jogador" || m.user_type === "representante_time"
    );
    const playerUids = playerMembers.map((m) => m.uid);
    const playersCount = playerMembers.length;

  const games = await Jogos.find({
    teams_id: teamId,
    status: { $ne: "cancelado" }
  }).lean();

  const matchesCount = games.length;

  const winsCount = games.filter(
    g => g.winner_team_id && String(g.winner_team_id) === String(teamId)
  ).length;

  const winsByMonth = buildWinsByMonth(games, teamId);

  const gameIds = games.map(g => g._id);

  let playerStats = [];
  if (gameIds.length && playerUids.length) {
    const statsDocs = await GameStats.find({
      game_id: { $in: gameIds },
      firebaseUid: { $in: playerUids }
    }).lean();

    const agg = new Map(); 

    statsDocs.forEach(s => {
      const uid = s.firebaseUid;
      if (!agg.has(uid)) {
        agg.set(uid, { goals: 0, assists: 0, matches: 0 });
      }
      const item = agg.get(uid);
      item.goals += s.goals || 0;
      item.assists += s.assists || 0;
      item.matches += 1;
    });

    const users = await User.find({
      firebaseUid: { $in: Array.from(agg.keys()) }
    }).lean();
    const nameByUid = new Map(
      users.map(u => [u.firebaseUid, u.nome || "Jogador"])
    );

    playerStats = Array.from(agg.entries()).map(([uid, vals]) => ({
      firebaseUid: uid,
      nome: nameByUid.get(uid) || "Jogador",
      goals: vals.goals,
      assists: vals.assists,
      matches: vals.matches
    }));

    playerStats.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  }

  const posCounts = new Map();
  playerMembers.forEach((m) => {
    const pos = m.position || "sem_posicao";
    posCounts.set(pos, (posCounts.get(pos) || 0) + 1);
  });

  const labelMap = {
    goleiro: "Goleiro",
    zagueiro: "Zagueiro",
    lateral: "Lateral",
    volante: "Volante",
    meia: "Meia",
    atacante: "Atacante",
    sem_posicao: "Sem posição"
  };

  const positionsDistribution = Array.from(posCounts.entries()).map(
    ([pos, value]) => ({
      label: labelMap[pos] || pos,
      value
    })
  );

  const alerts = [];

  return {
    team_id: team._id,
    team_name: team.nome,
    overview: {
      playersCount,
      matchesCount,
      winsCount
    },
    winsByMonth,
    players: playerStats,
    positionsDistribution,
    alerts
  };
}

module.exports = {
  getTeamStats
};
