const mongoose = require("mongoose");
const gameStats = require("../models/game_stats");
const User = require("../models/user");

async function listarStatusDeJogos() {
  return await gameStats.find();
}

async function buscarStatusDeJogo(id) {
  const status = await gameStats.findById(id);
  if (!status) throw new Error("Estatística de jogo não encontrada.");
  return status;
}

async function criarStatusDeJogo(dados, ctxUser) {
  const { game_id, firebaseUid, goals, assists } = dados || {};

  const finalGameId = game_id;
  const finalFirebaseUid = firebaseUid || ctxUser?.uid;

  if (!finalGameId || !finalFirebaseUid) {
    throw new Error("Informe game_id e o jogador (firebaseUid).");
  }

  const user = await User.findOne({ firebaseUid: finalFirebaseUid });
  if (!user) {
    throw new Error("Usuário com esse UID não encontrado no banco de dados.");
  }

  const jaExiste = await gameStats.findOne({
    game_id: finalGameId,
    firebaseUid: finalFirebaseUid,
  });

  if (jaExiste) {
    const update = {
      goals: goals ?? jaExiste.goals ?? 0,
      assists: assists ?? jaExiste.assists ?? 0,
    };

    if (ctxUser?.user_type === "jogador") {
      update.from_player = true;
    }

    if (ctxUser?.user_type === "representante_time") {
      update.confirmed_by_rep = true;
      update.from_player = false;
    }

    const atualizado = await gameStats.findByIdAndUpdate(
      jaExiste._id,
      update,
      { new: true, runValidators: true }
    );

    return atualizado;
  }

  const novaEstatistica = await gameStats.create({
    game_id: finalGameId,
    firebaseUid: finalFirebaseUid,
    goals: goals ?? 0,
    assists: assists ?? 0,
    from_player: ctxUser?.user_type === "jogador",
    confirmed_by_rep: ctxUser?.user_type === "representante_time",
  });

  return novaEstatistica;
}

async function atualizarStatusDeJogo(id, novosDados) {
  const status = await gameStats.findByIdAndUpdate(id, novosDados, {
    new: true,
    runValidators: true,
  });

  if (!status) throw new Error("Estatística de jogo não encontrada.");
  return status;
}

async function deletarStatusDeJogo(id) {
  const status = await gameStats.findByIdAndDelete(id);
  if (!status) throw new Error("Estatística de jogo não encontrada.");
  return { message: "Estatística de jogo deletada com sucesso." };
}

async function getGameStats(gameId) {
  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    throw new Error("ID do jogo inválido.");
  }

  const objectGameId = new mongoose.Types.ObjectId(gameId);

  const stats = await gameStats
    .find({ game_id: objectGameId })
    .lean();

  if (!stats || stats.length === 0) {
    return {
      game_id: gameId,
      totalGols: 0,
      totalAssistencias: 0,
      totalJogadores: 0,
      mediaGolsPorJogador: 0,
      jogadores: [],
    };
  }

  const jogadores = stats.map((s) => ({
    firebaseUid: s.firebaseUid,
    goals: s.goals || 0,
    assists: s.assists || 0,
    confirmed_by_rep: !!s.confirmed_by_rep,
  }));

  const totalGols = jogadores.reduce((acc, j) => acc + j.goals, 0);
  const totalAssistencias = jogadores.reduce((acc, j) => acc + j.assists, 0);
  const totalJogadores = jogadores.length;
  const mediaGolsPorJogador = totalJogadores ? totalGols / totalJogadores : 0;

  return {
    game_id: gameId,
    totalGols,
    totalAssistencias,
    totalJogadores,
    mediaGolsPorJogador,
    jogadores,
  };
}

module.exports = {
  listarStatusDeJogos,
  buscarStatusDeJogo,
  criarStatusDeJogo,
  atualizarStatusDeJogo,
  deletarStatusDeJogo,
  getGameStats,
};
