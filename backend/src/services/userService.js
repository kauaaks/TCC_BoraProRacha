//  Importa os models
const User = require("../models/user");
const GameStats = require("../models/game_stats");

// Importa dependências
const bcrypt = require("bcrypt");
const admin = require("../config/firebase");

//  Lista de roles permitidas
const allowedRoles = ["admin", "representante_time", "gestor_campo", "jogador"];


// 🧩 FUNÇÃO: getUserStats(userId)
    // Busca e consolida estatísticas de um usuário (via UID do Firebase)
  
async function getUserStats(userId) {
  //  Busca todas as estatísticas associadas ao UID do Firebase
  const stats = await GameStats.find({ firebaseUid: userId });

  //  Caso o jogador não tenha estatísticas
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

  // Soma e acumula os valores de todas as partidas
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

  // Calcula os totais finais
  total.totalPartidas = stats.length;
  total.mediaGols = total.gols / (stats.length || 1);

  return total;
}


/* 🔹 Lista todos os usuários */
async function listarUsuarios() {
  return await User.find();
}


/* 🔹 Busca usuário por ID (Mongo) */
async function buscarUsuarioPorId(id) {
  const user = await User.findById(id);
  if (!user) throw new Error("Usuário não encontrado");
  return user;
}


/*  Cria novo usuário */
async function criarUsuario(dados) {
  const { nome, email, senha, telefone, user_type } = dados;

  // ✅ 1. Validação básica
  if (!nome || !email || !senha || !telefone || !user_type)
    throw new Error("Preencha todos os campos obrigatórios");

  // ✅ 2. Verifica role válida
  if (!allowedRoles.includes(user_type))
    throw new Error("Função inválida");

  // ✅ 3. Verifica duplicidade de e-mail
  const jaExiste = await User.findOne({ email });
  if (jaExiste) throw new Error("Email já cadastrado");

  // ✅ 4. Cria no Firebase Auth
  const userRecord = await admin.auth().createUser({
    email,
    password: senha,
    displayName: nome,
    phoneNumber: telefone || undefined,
  });

  // ✅ 5. Cria no Mongo com UID do Firebase
  const novoUser = await User.create({
    nome,
    email,
    telefone,
    user_type,
    firebaseUid: userRecord.uid,
  });

  return novoUser;
}

/* -------------------------------------------------------------------------- */
/*  Atualiza dados do usuário */
async function atualizarUsuario(id, novosDados) {
  const user = await User.findByIdAndUpdate(id, novosDados, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new Error("Usuário não encontrado");
  return user;
}

/*  Deleta usuário */
async function deletarUsuario(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("Usuário não encontrado");
  return { message: "Usuário deletado com sucesso" };
}

/* -------------------------------------------------------------------------- */
/*  Exporta todas as funções */
module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  getUserStats, 
};
