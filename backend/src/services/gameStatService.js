const mongoose = require("mongoose");
const gameStats = require("../models/game_stats"); // importa o modelo do MongoDB

// Lista TODAS as estatísticas de jogos do banco
async function listarStatusDeJogos() {
    return await gameStats.find(); // busca todos os documentos
}

// Busca uma estatística de jogo específica pelo ID do documento
async function buscarStatusDeJogo(id) {
    const status = await gameStats.findById(id); // procura no banco o ID recebido
    if (!status) throw new Error("Estatística de jogo não encontrada."); // se não achar, lança erro
    return status; // retorna o documento encontrado
}

// Cria uma nova estatística de jogo
async function criarStatusDeJogo(dados) {
    const {
        game_id,
        firebase_uid, //  UID do Firebase
        goals,
        assists,
        fouls,
        minutes_played,
        yellow_cards,
        red_cards,
        attendance
    } = dados;

    // Valida se todos os campos obrigatórios foram preenchidos
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

    //  Verifica se já existe estatística desse jogador para o mesmo jogo
    const jaExiste = await gameStats.findOne({ game_id, firebase_uid });
    if (jaExiste)
        throw new Error("Estatística de jogo já cadastrada para este jogador e jogo.");

    // Cria a nova estatística no banco
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

    return novaEstatistica; // retorna o que acabou de ser criado
}

//  Atualiza uma estatística de jogo existente
async function atualizarStatusDeJogo(id, novosDados) {
    const status = await gameStats.findByIdAndUpdate(id, novosDados, {
        new: true, // retorna o documento atualizado
        runValidators: true // aplica as validações do schema
    });

    if (!status) throw new Error("Estatística de jogo não encontrada.");
    return status; // retorna o documento atualizado
}

// Deleta uma estatística de jogo pelo ID
async function deletarStatusDeJogo(id) {
    const status = await gameStats.findByIdAndDelete(id); // apaga o documento
    if (!status) throw new Error("Estatística de jogo não encontrada.");
    return { message: "Estatística de jogo deletada com sucesso." };
}

/**
 * Obtém as estatísticas GERAIS de um jogo específico (não de todos)
 * @param {String} gameId - ID do jogo no MongoDB
 */
async function getGameStats(gameId) {
    //  Verifica se o ID é válido no formato do Mongo
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        throw new Error("ID do jogo inválido.");
    }

    const objectGameId = new mongoose.Types.ObjectId(gameId);

    //  Busca todas as estatísticas desse jogo
    const stats = await gameStats.find({ game_id: objectGameId });

    // Caso não tenha estatísticas registradas
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

    // Agrupa somando os valores e gerando médias
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

    //  Calcula médias
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

//  Exporta todas as funções para serem usadas em rotas
module.exports = {
    listarStatusDeJogos,
    buscarStatusDeJogo,
    criarStatusDeJogo,
    atualizarStatusDeJogo,
    deletarStatusDeJogo,
    getGameStats
};
