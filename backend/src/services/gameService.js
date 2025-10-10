const games = require('../models/games');

async function listarJogos() {
    return await games.find();
}

async function buscarJogo(id) {
    const game = await games.findById(id);
    if (!game) throw new Error("jogo não encontrado.");
    return game;
}

async function criarJogo(dados) {
    const {teams_id, field_id, scheduled_date, status, duration} = dados;
    if (!teams_id || !field_id || !scheduled_date || !status || !duration)
        throw new Error("preencha todos os campos obrigatórios.");
    const jaExiste = await games.findOne({teams_id, field_id, scheduled_date, status});
    if (jaExiste) throw new Error("jogo ja cadastrado com esses dados.");
    const novoJogo = await games.create({
        teams_id,
        field_id,
        scheduled_date,
        status,
        duration
    });
    return novoJogo;
}

async function atualizarJogo(id, NovosDados) {
    const game = await games.findByIdAndUpdate(id, NovosDados, {
        new: true,
        runValidators: true
    });
    if (!game) throw new Error("jogo não encontrado.");
    return game;
}

async function deletarJogo(id) {
    const game = await games.findByIdAndDelete(id);
    if (!game) throw new Error("jogo não encontrado.");
    return { message: "jogo deletado com sucesso."};
}
module.exports = {
    listarJogos,
    buscarJogo,
    criarJogo,
    atualizarJogo,
    deletarJogo
};