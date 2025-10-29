const gameStats = require('../models/game_stats'); // importa o modelo do MongoDB

// 🔹 Lista TODAS as estatísticas de jogos do banco
async function listarStatusDeJogos() {
    return await gameStats.find(); // busca todos os documentos
}

// 🔹 Busca uma estatística de jogo específica pelo ID do documento
async function buscarStatusDeJogo(id) {
    const status = await gameStats.findById(id); // procura no banco o ID recebido
    if (!status) throw new Error("Estatística de jogo não encontrada."); // se não achar, lança erro
    return status; // retorna o documento encontrado
}

// 🔹 Cria uma nova estatística de jogo
async function criarStatusDeJogo(dados) {
    const {
        game_id,
        firebase_uid, // 👈 agora usamos o UID do Firebase
        goals,
        assists,
        fouls,
        minutes_played,
        yellow_cards,
        red_cards,
        attendance
    } = dados;

    // 🚨 Valida se todos os campos obrigatórios foram preenchidos
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

    // 🔍 Verifica se já existe estatística desse jogador para o mesmo jogo
    const jaExiste = await gameStats.findOne({ game_id, firebase_uid });
    if (jaExiste)
        throw new Error("Estatística de jogo já cadastrada para este jogador e jogo.");

    // 🆕 Cria a nova estatística no banco
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

// 🔹 Atualiza uma estatística de jogo existente
async function atualizarStatusDeJogo(id, novosDados) {
    const status = await gameStats.findByIdAndUpdate(id, novosDados, {
        new: true, // retorna o documento atualizado
        runValidators: true // aplica as validações do schema
    });

    if (!status) throw new Error("Estatística de jogo não encontrada.");
    return status; // retorna o documento atualizado
}

// 🔹 Deleta uma estatística de jogo pelo ID
async function deletarStatusDeJogo(id) {
    const status = await gameStats.findByIdAndDelete(id); // apaga o documento
    if (!status) throw new Error("Estatística de jogo não encontrada.");
    return { message: "Estatística de jogo deletada com sucesso." };
}

// 🔹 Agrupa estatísticas por jogo (para ver totais, médias, etc.)
async function getGameStats() {
    const stats = await gameStats.aggregate([
        {
            $group: {
                _id: "$game_id", // agrupa por ID do jogo
                totalGols: { $sum: "$goals" },
                totalAssistencias: { $sum: "$assists" },
                totalFaltas: { $sum: "$fouls" },
                totalCartoesAmarelos: { $sum: "$yellow_cards" },
                totalCartoesVermelhos: { $sum: "$red_cards" },
                totalMinutos: { $sum: "$minutes_played" },
                totalParticipacoes: {
                    $sum: {
                        $cond: [{ $eq: ["$attendance", true] }, 1, 0]
                    }
                },
                jogadoresParticipantes: { $addToSet: "$firebase_uid" } // 👈 conta cada UID único
            }
        },
        {
            $project: {
                _id: 0,
                game_id: "$_id",
                totalGols: 1,
                totalAssistencias: 1,
                totalFaltas: 1,
                totalCartoesAmarelos: 1,
                totalCartoesVermelhos: 1,
                totalMinutos: 1,
                totalParticipacoes: 1,
                totalJogadores: { $size: "$jogadoresParticipantes" },
                mediaGolsPorJogador: {
                    $cond: [
                        { $eq: [{ $size: "$jogadoresParticipantes" }, 0] },
                        0,
                        { $divide: ["$totalGols", { $size: "$jogadoresParticipantes" }] }
                    ]
                }
            }
        }
    ]);

    return stats; // retorna o array de estatísticas agrupadas
}

// 🔹 Exporta todas as funções para serem usadas em rotas
module.exports = {
    listarStatusDeJogos,
    buscarStatusDeJogo,
    criarStatusDeJogo,
    atualizarStatusDeJogo,
    deletarStatusDeJogo,
    getGameStats
};
