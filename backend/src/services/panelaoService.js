const Panelao = require('../models/panelao');
const Times = require('../models/teams');

// Fisher–Yates pra embaralhar array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Inicializa torneio quando sortear panelas com mais de 2 times
function initializeTournament(squads) {
  const numTeams = squads.length;
  
  if (numTeams <= 2) {
    return null;
  }

  const matches = [];
  let matchNumber = 1;

  if (numTeams === 4) {
    matches.push({
      round: "semis",
      matchNumber: matchNumber++,
      team1: { squadIndex: 0, name: squads[0].name },
      team2: { squadIndex: 1, name: squads[1].name },
      played: false
    });
    matches.push({
      round: "semis",
      matchNumber: matchNumber++,
      team1: { squadIndex: 2, name: squads[2].name },
      team2: { squadIndex: 3, name: squads[3].name },
      played: false
    });
  }

  if (numTeams === 3) {
    matches.push({
      round: "semis",
      matchNumber: matchNumber++,
      team1: { squadIndex: 1, name: squads[1].name },
      team2: { squadIndex: 2, name: squads[2].name },
      played: false
    });
  }

  if (numTeams === 5 || numTeams === 6) {
    for (let i = 0; i < Math.floor(numTeams / 2); i++) {
      matches.push({
        round: "quartas",
        matchNumber: matchNumber++,
        team1: { squadIndex: i * 2, name: squads[i * 2].name },
        team2: { squadIndex: i * 2 + 1, name: squads[i * 2 + 1].name },
        played: false
      });
    }
  }

  return {
    format: "single_elimination",
    matches,
    champion_squadIndex: null,
    second_squadIndex: null,
    third_squadIndex: null,
  };
}

// ✅ VALIDAÇÃO E CONVERSÃO ROBUSTA DE DATA
function validateAndConvertDate(dateValue) {
  if (!dateValue) {
    throw new Error("scheduled_date é obrigatório");
  }

  let date;
  
  // Se já é Date válido
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    date = dateValue;
  }
  // Se é string ISO válida
  else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  }
  // Se é objeto com toISOString (frontend Date serializado)
  else if (dateValue.toISOString && typeof dateValue.toISOString === 'function') {
    date = new Date(dateValue.toISOString());
  }
  // Outros casos
  else {
    date = new Date(dateValue);
  }

  // Validação final
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("scheduled_date inválido. Use formato ISO ou Date válido.");
  }

  return date;
}

// ✅ CRIAR PANELÃO COM VALIDAÇÃO DE DATA
async function criarPanelao(teamId, {
  nTimes = 2,
  is_tournament = false,
  scheduled_date,
  duration,
  invited_by,
  place,
  note,
} = {}) {
  // Validações básicas
  if (!teamId) throw new Error("teamId é obrigatório");
  if (!scheduled_date || !duration || !invited_by) {
    throw new Error("scheduled_date, duration e invited_by são obrigatórios.");
  }
  if (nTimes < 2) throw new Error("Número de times deve ser >= 2");

  // ✅ CONVERSÃO E VALIDAÇÃO DE DATA
  const validatedDate = validateAndConvertDate(scheduled_date);
  console.log('[SERVICE] Data validada:', validatedDate.toISOString());

  const team = await Times.findById(teamId).lean();
  if (!team) throw new Error("Time não encontrado");

  const novoPanelao = await Panelao.create({
    team_id: team._id,
    status: 'sorteio_pendente',
    scheduled_date: validatedDate,  // ✅ Data validada
    duration,
    n_times: Number(nTimes),
    is_tournament: Boolean(is_tournament),
    invited_by,
    place: place || "A definir",
    note: note || "",
    tournament: null
  });

  console.log('[SERVICE] ✅ Panelão criado:', novoPanelao._id, {
    n_times: novoPanelao.n_times,
    is_tournament: novoPanelao.is_tournament
  });

  return novoPanelao;
}

async function listarPaneloes(teamId) {
  if (!teamId) throw new Error("teamId é obrigatório");
  
  return await Panelao.find({ 
    team_id: teamId
  }).sort({ scheduled_date: -1 }).lean();
}

async function salvarSorteio(panelaoId, squads, uid) {
  const panelao = await Panelao.findById(panelaoId);
  
  if (!panelao) {
    throw new Error("Panelão não encontrado");
  }

  if (!squads || !Array.isArray(squads)) {
    throw new Error("squads é obrigatório e deve ser um array");
  }

  const nTimes = panelao.n_times || squads.length;
  
  panelao.squads = squads;
  panelao.status = "sorteio_realizado";
  
  if (nTimes > 2) {
    panelao.tournament = initializeTournament(squads);
    console.log('[SERVICE] ✅ Torneio inicializado:', nTimes, 'times');
  } else {
    panelao.tournament = null;
  }
  
  await panelao.save();
  return panelao;
}

async function registrarPlacar(panelaoId, { goals_team1, goals_team2, winner_squad_index }, uid) {
  const panelao = await Panelao.findById(panelaoId);
  
  if (!panelao) {
    throw new Error("Panelão não encontrado");
  }

  if (!Array.isArray(panelao.squads) || panelao.squads.length !== 2) {
    throw new Error("Esta função é apenas para jogos com 2 times. Use a função de torneio.");
  }

  if (goals_team1 == null || goals_team2 == null) {
    throw new Error("Informe os gols de ambos os times");
  }

  panelao.goals_team1 = Number(goals_team1);
  panelao.goals_team2 = Number(goals_team2);
  panelao.winner_squad_index = winner_squad_index != null ? Number(winner_squad_index) : null;

  await panelao.save();
  return panelao;
}

async function atualizarPartidaTorneio(panelaoId, { matchIndex, goals_team1, goals_team2, winner_squadIndex }, uid) {
  const panelao = await Panelao.findById(panelaoId);
  
  if (!panelao) {
    throw new Error("Panelão não encontrado");
  }

  if (!panelao.tournament) {
    throw new Error("Este panelão não tem torneio configurado");
  }

  const tournament = panelao.tournament;
  const matches = tournament.matches;

  if (matchIndex == null || matchIndex < 0 || matchIndex >= matches.length) {
    throw new Error("Índice de partida inválido");
  }

  if (goals_team1 == null || goals_team2 == null) {
    throw new Error("Informe os gols de ambos os times");
  }

  const match = matches[matchIndex];
  match.goals_team1 = Number(goals_team1);
  match.goals_team2 = Number(goals_team2);
  match.winner_squadIndex = winner_squadIndex != null ? Number(winner_squadIndex) : null;
  match.played = true;

  // Lógica para criar próximas fases (4 times e 3 times)
  const squads = panelao.squads || [];

  if (squads.length === 4 && tournament.format === "single_elimination") {
    const semis = matches.filter((m) => m.round === "semis");
    const allSemisPlayed = semis.length === 2 && semis.every((m) => m.played && m.winner_squadIndex != null);

    if (allSemisPlayed) {
      const [semi1, semi2] = semis;
      const winner1 = semi1.winner_squadIndex;
      const winner2 = semi2.winner_squadIndex;
      const loser1 = semi1.team1.squadIndex === winner1 ? semi1.team2.squadIndex : semi1.team1.squadIndex;
      const loser2 = semi2.team1.squadIndex === winner2 ? semi2.team2.squadIndex : semi2.team1.squadIndex;

      const alreadyHasFinal = matches.some((m) => m.round === "final");
      const alreadyHasThird = matches.some((m) => m.round === "terceiro_lugar");
      let nextMatchNumber = matches.reduce((max, m) => Math.max(max, m.matchNumber || 0), 0) + 1;

      if (!alreadyHasFinal) {
        matches.push({
          round: "final",
          matchNumber: nextMatchNumber++,
          team1: { squadIndex: winner1, name: squads[winner1]?.name || "Time A" },
          team2: { squadIndex: winner2, name: squads[winner2]?.name || "Time B" },
          played: false,
        });
      }

      if (!alreadyHasThird) {
        matches.push({
          round: "terceiro_lugar",
          matchNumber: nextMatchNumber++,
          team1: { squadIndex: loser1, name: squads[loser1]?.name || "Time C" },
          team2: { squadIndex: loser2, name: squads[loser2]?.name || "Time D" },
          played: false,
        });
      }
    }
  }

  if (squads.length === 3 && tournament.format === "single_elimination") {
    const semi = matches.find((m) => m.round === "semis");
    const alreadyHasFinal = matches.some((m) => m.round === "final");

    if (semi && semi.played && semi.winner_squadIndex != null && !alreadyHasFinal) {
      const winner = semi.winner_squadIndex;
      const fixedSquadIndex = 0;
      let nextMatchNumber = matches.reduce((max, m) => Math.max(max, m.matchNumber || 0), 0) + 1;

      matches.push({
        round: "final",
        matchNumber: nextMatchNumber,
        team1: { squadIndex: fixedSquadIndex, name: squads[fixedSquadIndex]?.name || "Time 1" },
        team2: { squadIndex: winner, name: squads[winner]?.name || "Time 2" },
        played: false,
      });
    }
  }

  panelao.markModified("tournament");
  await panelao.save();

  return panelao;
}

async function finalizarTorneio(panelaoId, { champion_squadIndex, second_squadIndex, third_squadIndex }, uid) {
  const panelao = await Panelao.findById(panelaoId);
  
  if (!panelao) {
    throw new Error("Panelão não encontrado");
  }

  if (!panelao.tournament) {
    throw new Error("Este panelão não tem torneio configurado");
  }

  if (champion_squadIndex == null) {
    throw new Error("Informe o campeão");
  }

  panelao.tournament.champion_squadIndex = Number(champion_squadIndex);
  if (second_squadIndex != null) panelao.tournament.second_squadIndex = Number(second_squadIndex);
  if (third_squadIndex != null) panelao.tournament.third_squadIndex = Number(third_squadIndex);

  panelao.markModified("tournament");
  await panelao.save();

  return panelao;
}

async function finalizarPanelao(panelaoId, uid) {
  const panelao = await Panelao.findById(panelaoId);
  
  if (!panelao) {
    throw new Error("Panelão não encontrado");
  }

  panelao.status = "terminado";
  panelao.finished_at = new Date();
  await panelao.save();

  return panelao;
}

async function buscarPanelaoPorId(panelaoId) {
  if (!panelaoId) throw new Error("panelaoId é obrigatório");

  const panelao = await Panelao.findById(panelaoId).lean();
  if (!panelao) {
    const err = new Error("Panelão não encontrado");
    err.statusCode = 404;
    throw err;
  }

  return panelao;
}

module.exports = {
  criarPanelao,
  listarPaneloes,
  salvarSorteio,
  finalizarPanelao,
  registrarPlacar,
  atualizarPartidaTorneio,
  finalizarTorneio,
  buscarPanelaoPorId
};
