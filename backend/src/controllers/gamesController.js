const gamesService = require('../services/gameService');

async function listarJogos(req, res) {
  try {
    const uid = req.user?.uid;
    const jogos = await gamesService.listarJogosDoRepresentante(uid);
    res.json(jogos);
  } catch (error) {
    console.error("Erro ao listar jogos:", error);
    res.status(500).json({ message: error.message || "Erro ao listar jogos" });
  }
}

async function criarJogo(req, res) {
  try {
    const { teams_id, field_id, scheduled_date, duration } = req.body;
    const uid = req.user?.uid;
    const novoJogo = await gamesService.criarJogo({
      teams_id,
      field_id,
      scheduled_date,
      duration,
      invited_by: uid
    });
    res.status(201).json(novoJogo);
  } catch (error) {
    console.error("Erro ao criar jogo:", error);
    res.status(400).json({ message: error.message || "Erro ao criar jogo" });
  }
}

async function aceitarJogo(req, res) {
  try {
    const { id } = req.params;
    const uid = req.user?.uid;
    const jogo = await gamesService.aceitarJogo(id, uid);
    res.json(jogo);
  } catch (error) {
    console.error("Erro ao aceitar jogo:", error);
    res.status(400).json({ message: error.message || "Erro ao aceitar jogo" });
  }
}

async function cancelarJogo(req, res) {
  try {
    const { id } = req.params;
    const uid = req.user?.uid;
    const jogo = await gamesService.cancelarJogo(id, uid);
    res.json(jogo);
  } catch (error) {
    console.error("Erro ao cancelar jogo:", error);
    res.status(400).json({ message: error.message || "Erro ao cancelar jogo" });
  }
}

async function marcarTerminado(req, res) {
  try {
    const { id } = req.params;
    const uid = req.user?.uid;
    const jogo = await gamesService.marcarTerminado(id, uid);
    res.json(jogo);
  } catch (error) {
    console.error("Erro ao marcar jogo como terminado:", error);
    res.status(400).json({ message: error.message || "Erro ao marcar jogo como terminado" });
  }
}

async function definirResultado(req, res) {
  try {
    const { id } = req.params;
    const uid = req.user?.uid;
    const { goals_team1, goals_team2, winner_team_id } = req.body;
    const jogo = await gamesService.definirResultado(id, uid, {
      goals_team1,
      goals_team2,
      winner_team_id
    });
    res.json(jogo);
  } catch (error) {
    console.error("Erro ao definir resultado:", error);
    res.status(400).json({ message: error.message || "Erro ao definir resultado" });
  }
}

async function listarJogosPorStatus(req, res) {
  try {
    const uid = req.user?.uid;
    const { status, teamId } = req.query;
    const jogos = await gamesService.listarJogosPorStatus(uid, status, teamId);
    res.json(jogos);
  } catch (error) {
    console.error("Erro ao listar jogos por status:", error);
    res.status(500).json({ message: error.message || "Erro ao listar jogos por status" });
  }
}

module.exports = {
  listarJogos,
  criarJogo,
  aceitarJogo,
  cancelarJogo,
  marcarTerminado,
  definirResultado,
  listarJogosPorStatus,
};
