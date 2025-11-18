const User = require("../models/user");
const GameStats = require("../models/game_stats");
const admin = require("../config/firebase");
const allowedRoles = ["admin", "representante_time", "gestor_campo", "jogador"];

// Estatísticas
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

// CRUD básico Mongo
async function listarUsuarios() {
  return await User.find();
}

async function buscarUsuarioPorFirebaseUid(firebaseUid) {
  try {
    const user = await User.findOne({ firebaseUid });
    return user || null;
  } catch (err) {
    console.error("[Service] Erro no Mongo:", err);
    throw err;
  }
}

// Consulta ao Firebase Admin (UserRecord) e harmonização de ausência
async function buscarUsuarioNoFirebase(firebaseUid) {
  try {
    const rec = await admin.auth().getUser(firebaseUid); // retorna UserRecord quando existe [web:254]
    // Se também existir no Mongo, priorize o doc local
    const doc = await User.findOne({ firebaseUid });
    if (doc) return doc;
    // Retorne objeto “UserRecord-like” com chaves esperadas pelo controller
    return {
      uid: rec.uid,
      displayName: rec.displayName || "",
      email: rec.email || null,
      _fromFirebase: true
    };
  } catch (err) {
    if (err?.code === 'auth/user-not-found') return null; // ausência → 404 no controller [web:255]
    throw err; // outros erros do Admin devem propagar
  }
}

async function criarUsuario(dados) {
  try {
    const { nome, telefone, user_type, firebaseUid } = dados;

    if (!nome || !telefone || !user_type || !firebaseUid)
      throw new Error("Preencha todos os campos obrigatórios");

    if (!allowedRoles.includes(user_type))
      throw new Error(`Função inválida. Permitidas: ${allowedRoles.join(", ")}`);

    let existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      console.log("[Service] Usuário já existe no Mongo:", existingUser);
      return existingUser;
    }

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

// Atualização com whitelisting
const ALLOW_UPDATE = new Set(["nome", "telefone", "ativo", "user_type"]);

function pickAllowed(data) {
  const out = {};
  for (const k of Object.keys(data || {})) {
    if (ALLOW_UPDATE.has(k)) out[k] = data[k];
  }
  return out;
}

async function atualizarUsuario(firebaseUidAutenticado, novosDados) {
  if (!firebaseUidAutenticado) {
    const err = new Error("UID ausente");
    err.status = 401;
    throw err;
  }

  const update = pickAllowed(novosDados);

  if (update.nome) update.nome = String(update.nome).trim();
  if (update.telefone) update.telefone = String(update.telefone).trim();

  if (Object.prototype.hasOwnProperty.call(update, "user_type")) {
    if (!allowedRoles.includes(update.user_type)) {
      const err = new Error(`Função inválida. Permitidas: ${allowedRoles.join(", ")}`);
      err.status = 400;
      throw err;
    }
  }

  const user = await User.findOneAndUpdate(
    { firebaseUid: firebaseUidAutenticado },
    update,
    { new: true, runValidators: true }
  );

  if (!user) {
    const err = new Error("Usuário não encontrado");
    err.status = 404;
    throw err;
  }
  return user;
}

async function deletarUsuario(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("Usuário não encontrado");
  return { message: "Usuário deletado com sucesso" };
}

module.exports = {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  getUserStats,
  buscarUsuarioPorFirebaseUid,
  buscarUsuarioNoFirebase
};
