const gameStatService = require('../services/gameStatService');

async function listarStatusDeJogos(req, res) {
    try {
        const gameStats = await gameStatService.listarStatusDeJogos();
        res.json(gameStats);
    } catch (err){
        res.status(500).json({error: err.message});
    }
}

async function buscarStatusDeJogo(req, res) {
    try {
        const gameStat = await gameStatService.buscarStatusDeJogo(req.params.id);
        res.status(200).json(gameStat);
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}

async function criarStatusDeJogo(req, res) {
    try {
        const newGameStat = await gameStatService.criarStatusDeJogo(req.body);
        res.status(201).json(newGameStat);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

async function atualizarStatusDeJogo(req, res) {
    try {
        const gameStat = await gameStatService.atualizarStatusDeJogo( req.params.id, req.body, {new: true, runValidators: true});
         res.status(200).json(gameStat);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
} 

async function deletarGameStat(req, res) {
    try {
        const gameStat = await gameStatService.deletarGameStat(req.params.id);
        res.status(200).json(gameStat); 
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}

module.exports = {
    listarStatusDeJogos,
    buscarStatusDeJogo,
    criarStatusDeJogo,
    atualizarStatusDeJogo,
    deletarGameStat
};