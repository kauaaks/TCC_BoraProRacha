const mongoose = require("mongoose");
const gameStats = require("../models/game_stats");
const User = require("../models/user"); // 🔹 importa o modelo de usuário

// Lista TODAS as estatísticas de jogos do banco
async function listarStatusDeJogos() {
    return await gameStats.find();
}

// Busca uma estatística de jogo específica pelo ID do documento
async function buscarStatusDeJogo(id) {
    const status = await gameStats.findById(id);
    if (!status) throw new Error("Estatística de jogo não encontrada.");
    return status;
}

// Cria uma nova estatística de jogo
async function criarStatusDeJogo(dados) {
    const {
        game_id,
        firebase_uid,
        goals,
        assists,
        fouls,
        minutes_played,
        yellow_cards,
        red_cards,
        attendance
    } = dados;

    // ✅ 1. Valida campos obrigatórios
    if (
        !game_id ||
        !firebase_uid ||
        goals === undefined ||
        assists === undefined ||
        fouls === undefined ||
        minutes_played === undefined ||
        yellow_cards === undefined ||
        red_cards === undefined ||
        attendance === undefined
    ) {
        throw new Error("Preencha todos os campos obrigatórios.");
    }

    // ✅ 2. Verifica se o UID existe na coleção de usuários
    const user = await User.findOne({ firebaseUid: firebase_uid });
    if (!user) {
        throw new Error("Usuário com esse UID não encontrado no banco de dados.");
    }

    // ✅ 3. Verifica se já existe estatística desse jogador para o mesmo jogo
    const jaExiste = await gameStats.findOne({ game_id, firebase_uid });
    if (jaExiste) {
        throw new Error("Estatística de jogo já cadastrada para este jogador e jogo.");
    }

    // ✅ 4. Cria a nova estatística no banco
    const novaEstatistica = await gameStats.create({
        game_id,
        firebase_uid,
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

// Atualiza uma estatística de jogo existente
async function atualizarStatusDeJogo(id, novosDados) {
    const status = await gameStats.findByIdAndUpdate(id, novosDados, {
        new: true,
        runValidators: true
    });

    if (!status) throw new Error("Estatística de jogo não encontrada.");
    return status;
}

// Deleta uma estatística de jogo pelo ID
async function deletarStatusDeJogo(id) {
    const status = await gameStats.findByIdAndDelete(id);
    if (!status) throw new Error("Estatística de jogo não encontrada.");
    return { message: "Estatística de jogo deletada com sucesso." };
}

// Obtém as estatísticas GERAIS de um jogo específico
async function getGameStats(gameId) {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        throw new Error("ID do jogo inválido.");
    }

    const objectGameId = new mongoose.Types.ObjectId(gameId);
    const stats = await gameStats.find({ game_id: objectGameId });

    if (!stats || stats.length === 0) {
        return {
            game_id: gameId,
            totalGols: 0,
            totalAssistencias: 0,
            totalFaltas: 0,
            totalCartoesAmarelos: 0,
            totalCartoesVermelhos: 0,
            totalMinutos: 0,
            totalParticipacoes: 0,
            totalJogadores: 0,
            mediaGolsPorJogador: 0,
            jogadores: []
        };
    }

    const total = stats.reduce(
        (acc, s) => {
            acc.totalGols += s.goals || 0;
            acc.totalAssistencias += s.assists || 0;
            acc.totalFaltas += s.fouls || 0;
            acc.totalCartoesAmarelos += s.yellow_cards || 0;
            acc.totalCartoesVermelhos += s.red_cards || 0;
            acc.totalMinutos += s.minutes_played || 0;
            acc.totalParticipacoes += s.attendance ? 1 : 0;
            if (!acc.uids.includes(s.firebase_uid)) acc.uids.push(s.firebase_uid);
            return acc;
        },
        {
            totalGols: 0,
            totalAssistencias: 0,
            totalFaltas: 0,
            totalCartoesAmarelos: 0,
            totalCartoesVermelhos: 0,
            totalMinutos: 0,
            totalParticipacoes: 0,
            uids: []
        }
    );

    const totalJogadores = total.uids.length;
    const mediaGolsPorJogador = totalJogadores
        ? total.totalGols / totalJogadores
        : 0;

    return {
        game_id: gameId,
        totalGols: total.totalGols,
        totalAssistencias: total.totalAssistencias,
        totalFaltas: total.totalFaltas,
        totalCartoesAmarelos: total.totalCartoesAmarelos,
        totalCartoesVermelhos: total.totalCartoesVermelhos,
        totalMinutos: total.totalMinutos,
        totalParticipacoes: total.totalParticipacoes,
        totalJogadores,
        mediaGolsPorJogador,
        jogadores: total.uids
    };
}

module.exports = {
    listarStatusDeJogos,
    buscarStatusDeJogo,
    criarStatusDeJogo,
    atualizarStatusDeJogo,
    deletarStatusDeJogo,
    getGameStats
};
