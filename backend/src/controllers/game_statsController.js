const gameStatService = require('../services/gameStatService');

async function listarStatusDeJogos(req, res) {
  try {
    const gameStats = await gameStatService.listarStatusDeJogos();
    res.status(200).json(gameStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function buscarStatusDeJogo(req, res) {
  try {
    const gameStat = await gameStatService.buscarStatusDeJogo(req.params.id);
    res.status(200).json(gameStat);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function criarStatusDeJogo(req, res) {
  try {
    const newGameStat = await gameStatService.criarStatusDeJogo(req.body, req.user);
    res.status(201).json(newGameStat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function atualizarStatusDeJogo(req, res) {
  try {
    const updatedGameStat = await gameStatService.atualizarStatusDeJogo(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedGameStat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deletarGameStat(req, res) {
  try {
    const deletedGameStat = await gameStatService.deletarStatusDeJogo(req.params.id);
    res.status(200).json(deletedGameStat);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function getGameStats(req, res) {
  try {
    const { game_id } = req.params;
    const stats = await gameStatService.getGameStats(game_id);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listarStatusDeJogos,
  buscarStatusDeJogo,
  criarStatusDeJogo,
  atualizarStatusDeJogo,
  deletarGameStat,
  getGameStats 
};
