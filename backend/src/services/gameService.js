const games = require('../models/games');
const Times = require('../models/teams');

function isRepOfTeam(uid, time) {
  if (time.created_by.uid === uid && time.created_by.user_type === 'representante_time') return true;
  if (Array.isArray(time.members)) {
    return time.members.some(m => m.uid === uid && m.user_type === 'representante_time');
  }
  return false;
}

async function listarJogosDoRepresentante(uid) {
  return await games.find();
}

async function buscarJogo(id) {
  const game = await games.findById(id);
  if (!game) throw new Error("jogo não encontrado.");
  return game;
}

async function criarJogo({ teams_id, field_id, scheduled_date, duration, invited_by }) {
  if (!teams_id || !field_id || !scheduled_date || !duration || !invited_by) {
    throw new Error("preencha todos os campos obrigatórios.");
  }

  const jaExiste = await games.findOne({
    teams_id,
    field_id,
    scheduled_date,
    status: { $nin: ['cancelado', 'terminado'] }
  });
  if (jaExiste) throw new Error("jogo já cadastrado com esses dados.");

  const novoJogo = await games.create({
    teams_id,
    field_id,
    scheduled_date,
    status: 'pendente',
    duration,
    invited_by,
    accepted_by: null,
    cancelled_by: null,
    finished_by: [],
    goals_team1: 0,
    goals_team2: 0,
    winner_team_id: null
  });
  return novoJogo;
}

async function aceitarJogo(jogoId, uid) {
  const jogo = await games.findById(jogoId);
  if (!jogo) throw new Error("jogo não encontrado.");
  if (jogo.status !== 'pendente') throw new Error("jogo não está pendente.");
  jogo.status = 'aceito';
  jogo.accepted_by = uid;
  await jogo.save();
  return jogo;
}

async function cancelarJogo(jogoId, uid) {
  const jogo = await games.findById(jogoId);
  if (!jogo) throw new Error("jogo não encontrado.");
  if (jogo.status === 'cancelado' || jogo.status === 'terminado')
    throw new Error("jogo já cancelado ou terminado.");
  jogo.status = 'cancelado';
  jogo.cancelled_by = uid;
  await jogo.save();
  return jogo;
}

async function definirResultado(jogoId, uid, { goals_team1, goals_team2, winner_team_id }) {
  const jogo = await games.findById(jogoId);
  if (!jogo) throw new Error("jogo não encontrado.");

  if (jogo.status !== 'aceito' && jogo.status !== 'terminado') {
    throw new Error("Somente jogos aceitos podem ter resultado definido.");
  }

  const times = await Times.find({ _id: { $in: jogo.teams_id } });
  const isRep = times.some(t => isRepOfTeam(uid, t));
  if (!isRep) {
    throw new Error("Só representantes dos times podem definir o resultado.");
  }

  if (goals_team1 == null || goals_team2 == null) {
    throw new Error("Informe os gols de cada time.");
  }

  jogo.goals_team1 = Number(goals_team1);
  jogo.goals_team2 = Number(goals_team2);

  if (winner_team_id) {
    const pertenceAoJogo = jogo.teams_id.some(
      id => String(id) === String(winner_team_id)
    );
    if (!pertenceAoJogo) {
      throw new Error("winner_team_id não pertence a este jogo.");
    }
    jogo.winner_team_id = winner_team_id;
  } else {
    jogo.winner_team_id = null;
  }

  await jogo.save();
  return jogo;
}

async function marcarTerminado(jogoId, uid) {
  const jogo = await games.findById(jogoId);
  if (!jogo) throw new Error("jogo não encontrado.");
  if (jogo.status !== 'aceito' && jogo.status !== 'terminado')
    throw new Error("Somente jogos aceitos podem ser terminados.");

  if (jogo.goals_team1 == null || jogo.goals_team2 == null) {
    throw new Error("Defina o resultado do jogo antes de marcar como terminado.");
  }

  if (!jogo.finished_by.includes(uid)) jogo.finished_by.push(uid);

  const times = await Times.find({ _id: { $in: jogo.teams_id } });
  const repUids = [];
  for (const t of times) {
    if (t.created_by.user_type === 'representante_time') repUids.push(t.created_by.uid);
    if (Array.isArray(t.members)) {
      t.members.forEach(m => m.user_type === 'representante_time' && repUids.push(m.uid));
    }
  }
  const uniqueRepUids = Array.from(new Set(repUids));

  if (uniqueRepUids.every(u => jogo.finished_by.includes(u))) {
    jogo.status = 'terminado';
  }
  await jogo.save();
  return jogo;
}

async function listarJogosPorStatus(uid, status, teamId) {
  const query = { status };
  if (teamId) {
    query.teams_id = teamId;
  }

  const jogos = await games
    .find(query)
    .populate('teams_id', 'nome') 
    .lean();

  return jogos.map(j => {
    const teams = Array.isArray(j.teams_id) ? j.teams_id : [];
    return {
      ...j,
      teams_names: teams.map(t => t.nome || 'Time'),
      i_am_invited: j.invited_by && j.invited_by !== uid
    };
  });
}

module.exports = {
  listarJogosDoRepresentante,
  buscarJogo,
  criarJogo,
  aceitarJogo,
  cancelarJogo,
  marcarTerminado,
  listarJogosPorStatus,
  definirResultado,
};
