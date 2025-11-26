const gameService = require('../services/gameService');
const Times = require('../models/teams.js');

function isRepOfTeam(uid, time) {
  if (time.created_by.uid === uid && time.created_by.user_type === 'representante_time') return true;
  if (Array.isArray(time.members)) {
    return time.members.some(m => m.uid === uid && m.user_type === 'representante_time');
  }
  return false;
}

async function listarJogos(req, res) {
  try {
    const jogos = await gameService.listarJogosDoRepresentante(req.user.uid);
    res.json(jogos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function criarJogo(req, res) {
  try {
    // Apenas representante pode criar
    if (req.user.user_type !== 'representante_time')
      return res.status(403).json({ message: "Apenas representantes podem criar jogos" });

    const { teams_id } = req.body;
    if (!Array.isArray(teams_id) || teams_id.length !== 2)
      return res.status(400).json({ message: "Informe exatamente 2 times (teams_id)" });

    // Só representante de um dos times pode criar
    const times = await Times.find({ _id: { $in: teams_id } });
    const isRep = times.some(t => isRepOfTeam(req.user.uid, t));
    if (!isRep) return res.status(403).json({ message: "Você não é representante de nenhum desses times" });

    const jogo = await gameService.criarJogo({
      ...req.body,
      invited_by: req.user.uid
    });
    res.status(201).json(jogo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function aceitarJogo(req, res) {
  try {
    const jogo = await gameService.buscarJogo(req.params.id);
    const times = await Times.find({ _id: { $in: jogo.teams_id } });

    let invitedTeam;
    for (const time of times) {
      if (!isRepOfTeam(jogo.invited_by, time)) {
        invitedTeam = time;
        break;
      }
    }
    if (!invitedTeam) {
      return res.status(403).json({ message: "Time convidado não encontrado" });
    }

    if (!isRepOfTeam(req.user.uid, invitedTeam)) {
      return res.status(403).json({ message: "Só representante do time convidado pode aceitar convite" });
    }

    const newJogo = await gameService.aceitarJogo(req.params.id, req.user.uid);
    res.json(newJogo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function cancelarJogo(req, res) {
  try {
    const jogo = await gameService.buscarJogo(req.params.id);
    const times = await Times.find({ _id: { $in: jogo.teams_id } });
    const isRep = times.some(t => isRepOfTeam(req.user.uid, t));
    if (!isRep) return res.status(403).json({ message: "Só representantes dos times deste jogo podem cancelar" });

    const newJogo = await gameService.cancelarJogo(req.params.id, req.user.uid);
    res.json(newJogo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function marcarTerminado(req, res) {
  try {
    const jogo = await gameService.buscarJogo(req.params.id);
    const times = await Times.find({ _id: { $in: jogo.teams_id } });
    const isRep = times.some(t => isRepOfTeam(req.user.uid, t));
    if (!isRep) return res.status(403).json({ message: "Só representantes dos times podem marcar terminado" });

    const newJogo = await gameService.marcarTerminado(req.params.id, req.user.uid);
    res.json(newJogo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function listarJogosPorStatus(req, res) {
  try {
    const { status, teamId } = req.query;
    const jogos = await gameService.listarJogosPorStatus(req.user.uid, status, teamId || null);
    res.json(jogos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * NOVO: definir resultado (gols + vencedor/empate)
 * controller só repassa para a service
 */
async function definirResultado(req, res) {
  try {
    const { id } = req.params;
    const { goals_team1, goals_team2, winner_team_id } = req.body;

    const jogo = await gameService.definirResultado(
      id,
      req.user.uid,
      { goals_team1, goals_team2, winner_team_id }
    );

    return res.status(200).json(jogo);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  listarJogos,        // GET /games
  criarJogo,          // POST /games
  aceitarJogo,        // POST /games/:id/accept
  cancelarJogo,       // POST /games/:id/cancel
  marcarTerminado,    // POST /games/:id/finish
  listarJogosPorStatus, // GET /games/status
  definirResultado    // PUT /games/:id/result
};
