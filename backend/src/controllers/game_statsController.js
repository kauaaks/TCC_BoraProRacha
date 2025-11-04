const gameStatService = require('../services/gameStatService');

// Lista TODAS as estatísticas individuais de jogos
async function listarStatusDeJogos(req, res) {
    try {
        const gameStats = await gameStatService.listarStatusDeJogos();
        res.status(200).json(gameStats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Busca uma estatística de jogo específica pelo ID do documento
async function buscarStatusDeJogo(req, res) {
    try {
        const gameStat = await gameStatService.buscarStatusDeJogo(req.params.id);
        res.status(200).json(gameStat);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}

// Cria uma nova estatística de jogo
async function criarStatusDeJogo(req, res) {
    try {
        const newGameStat = await gameStatService.criarStatusDeJogo(req.body);
        res.status(201).json(newGameStat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Atualiza uma estatística de jogo existente
async function atualizarStatusDeJogo(req, res) {
    try {
        const updatedGameStat = await gameStatService.atualizarStatusDeJogo(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedGameStat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Deleta uma estatística de jogo específica
async function deletarGameStat(req, res) {
    try {
        const deletedGameStat = await gameStatService.deletarStatusDeJogo(req.params.id);
        res.status(200).json(deletedGameStat);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}

// Obtém as estatísticas GERAIS de um jogo específico (totais e médias)
async function getGameStats(req, res) {
    try {
        const { game_id } = req.params; // obtém o ID do jogo da URL
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
