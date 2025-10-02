const Game_stats = require('../models/game_stats');

async function listarStatusDeJogos(req, res) {
    try {
        const gameStats = await Game_stats.find();
        res.json(gameStats);
    } catch (err){
        res.status(500).json({error: err.message});
    }
}

async function buscarStatusDeJogo(req, res) {
    try {
        const gameStat = await Game_stats.findById(req.params.id);
        if (!gameStat) return res.status(404).json({error: "Não encontrado(status de jogo)"});
        res.json(gameStat);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

async function criarStatusDeJogo(req, res) {
    try {
        const {game_id, user_id, goals, assists, fouls, minutes_played, yellow_cards, red_cards, attendance} = req.body;
        newGameStat = new Game_stats({game_id, user_id, goals, assists, fouls, minutes_played, yellow_cards, red_cards, attendance});
        await newGameStat.save();
        res.status(201).json(newGameStat);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

async function atualizarStatusDeJogo(req, res) {
    try {
        const gameStat = await Game_stats.findByIdAndUpdate( req.params.id, req.body, {new: true, runValidators: true});
        if (!gameStat) return res.status(404).json({error: "Não encontrado(status de jogo)"});
        res.json(gameStat);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
} 

async function deletarGameStat(req, res) {
    try {
        const gameStat = await Game_stats.findByIdAndDelete(req.params.id);
        if (!gameStat) return res.status(404).json({error: "Não encontrado(status de jogo)"});
        res.json({message: "Status de jogo deletado com sucesso"}); 
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

module.exports = {
    listarStatusDeJogos,
    buscarStatusDeJogo,
    criarStatusDeJogo,
    atualizarStatusDeJogo,
    deletarGameStat
};