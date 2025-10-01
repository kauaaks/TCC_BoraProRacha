const Games = require('../models/games');

async function listarJogos(req, res) {
    try {
        const jogos = await Games.find();
        res.json(jogos);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
}

async function buscarJogo(req, res) {
    try {
        const jogo = await Games.findById(req.params.id);

        if (!jogo) return res.status(404).json({ error: "jogo não encontrado."});

        res.json(jogo);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
}

async function criarJogo(req, res) {
    try {
        const { teams_id, field_id, scheduled_date, status, duration} = req.body;
        const novoJogo = new Games({ teams_id, field_id, scheduled_date, status, duration});
        await novoJogo.save();
        res.status(201).json(novoJogo);
    } catch (err) {
        res.status(400).json({ error: err.message});
    }
}

async function atualizarJogo(req, res) {
    try {
        const jogoAtualizado = await Games.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true}
        );

        if (!jogoAtualizado) return res.status(404).json({ error: "jogo não encontrado."});

        res.json(jogoAtualizado);
    } catch (err) {
        res.status(400).json({ error: err.message});
    }
}

async function deletarJogo(req, res) {
    try {
     const jogoDeletado = await Games.findByIdAndDelete(req.params.id);

     if (!jogoDeletado) return res.status(404).json({error: "jogo não encontrado."});

     res.json({message: "jogo deletado com sucesso."});
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
}

module.exports = {
    listarJogos,
    buscarJogo,
    criarJogo,
    atualizarJogo,
    deletarJogo
};