const gameService = require('../services/gameService');

async function listarJogos(req, res) {
    try {
        const jogos = await gameService.listarJogos();
        res.json(jogos);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
}

async function buscarJogo(req, res) {
    try {
        const jogo = await gameService.buscarJogo(req.params.id);
        res.status(200).json(jogo);
    } catch (err) {
        res.status(404).json({ error: err.message});
    }
}

async function criarJogo(req, res) {
    try {
        const novoJogo = await gameService.criarJogo(req.body);
        res.status(201).json(novoJogo);
    } catch (err) {
        res.status(400).json({ error: err.message});
    }
}

async function atualizarJogo(req, res) {
    try {
        const jogoAtualizado = await gameService.atualizarJogo(
            req.params.id,
            req.body,
            { new: true, runValidators: true}
        );
        res.status(200).json(jogoAtualizado);
    } catch (err) {
        res.status(400).json({ error: err.message});
    }
}

async function deletarJogo(req, res) {
    try {
     const jogoDeletado = await gameService.deletarJogo(req.params.id);
     res.status(200).json(jogoDeletado);
    } catch (err) {
        res.status(404).json({ error: err.message});
    }
}

module.exports = {
    listarJogos,
    buscarJogo,
    criarJogo,
    atualizarJogo,
    deletarJogo
};