const gameStats = require('../models/game_stats');

async function listarStatusDeJogos() {
    return await gameStats.find();
}

async function buscarStatusDeJogo(id) {
    const status = await gameStats.findById(id);
    if (!status) throw new Error("estatística de jogo não encontrada.");
    return status;
}

async function criarStatusDeJogo(dados) {
    const {game_id, user_id, goals, assists, fouls, minutes_played, yellow_cards, red_cards, attendance} = dados;
    if (!game_id, user_id, goals, assists, fouls, minutes_played, yellow_cards, red_cards, attendance) 
        throw new Error("Preencha todos os campos obrigatórios.");
    jaExiste = await gameStats.findOne ({game_id, user_id});
    if (jaExiste) throw new Error("estatística de jogo já cadastrada para este usuário e jogo.");
    const novaEstatistica = await gameStats.create({
        game_id,
        user_id,
        goals,
        assists,
        fouls,
        minutes_played,
        yellow_cards,
        red_cards,
        attendance
    });
    return novaEstatistica;
}

async function atualizarStatusDeJogo(id, NovosDados) {
    const status = await gameStats.findByIdAndUpdate(id, NovosDados, {new: true, runValidators:true});
    if (!status) throw new Error("estatística de jogo não encontrada.");
    return status;
}

async function deletarStatusDeJogo(id) {
    const status = await gameStats.findByIdAndDelete(id);
    if (!status) throw new Error("estatística de jogo não encontrada.");
    return { message: "estatística de jogo deletada com sucesso."};
}

module.exports = {
    listarStatusDeJogos,
    buscarStatusDeJogo,
    criarStatusDeJogo,
    atualizarStatusDeJogo,
    deletarStatusDeJogo,
};