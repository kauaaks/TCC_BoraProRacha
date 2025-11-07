// Importa os models
const User = require("../models/user");
const GameStats = require("../models/game_stats");

// Importa dependências
const admin = require("../config/firebase");

// Lista de roles permitidas
const allowedRoles = ["admin", "representante_time", "gestor_campo", "jogador"];

// 🧩 FUNÇÃO: getUserStats(userId)
async function getUserStats(userId) {
  const stats = await GameStats.find({ firebaseUid: userId });

  if (!stats || stats.length === 0) {
    return {
      totalPartidas: 0,
      gols: 0,
      assistencias: 0,
      faltas: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0,
      minutosJogador: 0,
      participacoes: 0,
      mediaGols: 0,
    };
  }

  const total = stats.reduce(
    (acc, s) => {
      acc.gols += s.goals || 0;
      acc.assistencias += s.assists || 0;
      acc.faltas += s.fouls || 0;
      acc.cartoesAmarelos += s.yellow_cards || 0;
      acc.cartoesVermelhos += s.red_cards || 0;
      acc.minutosJogador += s.minutes_played || 0;
      acc.participacoes += s.attendance ? 1 : 0;
      return acc;
    },
    {
      gols: 0,
      assistencias: 0,
      faltas: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0,
      minutosJogador: 0,
      participacoes: 0,
    }
  );

  total.totalPartidas = stats.length;
  total.mediaGols = total.gols / (stats.length || 1);

  return total;
}

// 🔹 Lista todos os usuários
async function listarUsuarios() {
  return await User.find();
}

// 🔹 Busca usuário por UID do Firebase no Mongo
async function buscarUsuarioPorFirebaseUid(firebaseUid) {
  try {
    const user = await User.findOne({ firebaseUid });
    return user || null;
  } catch (err) {
    console.error("[Service] Erro no Mongo:", err);
    throw err;
  }
}

// 🔹 Busca usuário por ID (Mongo)
async function buscarUsuarioPorId(id) {
  const user = await User.findById(id);
  if (!user) throw new Error("Usuário não encontrado");
  return user;
}

// 🔹 Busca usuário no Firebase
async function buscarUsuarioNoFirebase(firebaseUid) {
  try {
    const userRecord = await admin.auth().getUser(firebaseUid);
    return userRecord;
  } catch (err) {
    if (err.code === "auth/user-not-found") return null;
    throw err;
  }
}

// 🔹 Cria novo usuário (somente Mongo se UID já existir no Firebase)
async function criarUsuario(dados) {
  try {
    const { nome, telefone, user_type, firebaseUid } = dados;

    // validação básica
    if (!nome || !telefone || !user_type || !firebaseUid)
      throw new Error("Preencha todos os campos obrigatórios");

    if (!allowedRoles.includes(user_type))
      throw new Error(`Função inválida. Permitidas: ${allowedRoles.join(", ")}`);

    // ✅ Verifica se já existe no Mongo pelo firebaseUid
    let existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      console.log("[Service] Usuário já existe no Mongo:", existingUser);
      return existingUser; // Retorna o usuário existente
    }

    // Cria usuário no Mongo
    const novoUser = await User.create({
      nome,
      telefone,
      user_type,
      firebaseUid,
      ativo: true,
    });

    console.log("[Service] Usuário criado no Mongo:", novoUser);

    return {
      success: true,
      message: "Usuário criado no Mongo com sucesso",
      user: novoUser,
    };
  } catch (err) {
    console.error("[Service] Erro ao criar usuário:", err.message);
    throw err;
  }
}

// 🔹 Atualiza dados do usuário
async function atualizarUsuario(id, novosDados) {
  const user = await User.findByIdAndUpdate(id, novosDados, { new: true, runValidators: true });
  if (!user) throw new Error("Usuário não encontrado");
  return user;
}

// 🔹 Deleta usuário
async function deletarUsuario(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("Usuário não encontrado");
  return { message: "Usuário deletado com sucesso" };
}

// Exporta todas as funções
module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  getUserStats,
  buscarUsuarioPorFirebaseUid,
  buscarUsuarioNoFirebase,
};
