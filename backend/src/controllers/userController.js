const userService = require("../services/userService");

// Buscar usuário pelo Firebase UID
async function buscarUsuarioPorFirebaseUid(req, res) {
  const { uid } = req.params;
  console.log("[Controller] Buscar usuário por Firebase UID:", uid);

  try {
    let user = await userService.buscarUsuarioPorFirebaseUid(uid);

    if (!user) {
      console.log("[Controller] Usuário não encontrado no Mongo, verificando Firebase...");

      const firebaseUser = await userService.buscarUsuarioNoFirebase(uid);
      if (!firebaseUser) {
        return res.status(404).json({ error: "Usuário não encontrado nem no Mongo nem no Firebase" });
      }

      user = await userService.criarUsuario({
        firebaseUid: firebaseUser.uid,
        nome: firebaseUser.displayName || "Sem nome",
        email: firebaseUser.email,
        telefone: "00000000000", // padrão
        user_type: "jogador", // padrão
        ativo: true,
      });

      console.log("[Controller] Usuário criado no Mongo a partir do Firebase:", user);
      return res.status(201).json(user);
    }

    console.log("[Controller] Usuário encontrado:", user);
    res.status(200).json(user);
  } catch (err) {
    console.error("[Controller] Erro ao buscar/criar usuário:", err);
    res.status(500).json({ error: err.message });
  }
}

// Criar usuário via POST
async function criarUsuario(req, res) {
  const { firebaseUid, nome, telefone, user_type } = req.body;
  console.log("[Controller] Criar usuário, body recebido:", req.body);

  if (!nome || !telefone || !user_type) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
  }

  try {
    const novoUser = await userService.criarUsuario({
      firebaseUid,
      nome,
      telefone,
      user_type,
      ativo: true,
    });

    console.log("[Controller] Usuário criado com sucesso:", novoUser);
    res.status(201).json(novoUser);
  } catch (err) {
    console.error("[Controller] Erro ao criar usuário:", err);

    // Tenta recuperar usuário existente no Mongo caso já exista
    if (err.message.includes("already exists") || err.message.includes("Email já cadastrado")) {
      try {
        const existingUser = await userService.buscarUsuarioPorFirebaseUid(firebaseUid);
        console.log("[Controller] Usuário já existia, retornando existente:", existingUser);
        return res.status(200).json(existingUser);
      } catch (mongoErr) {
        console.error("[Controller] Erro ao recuperar usuário existente:", mongoErr);
        return res.status(500).json({ error: mongoErr.message });
      }
    }

    res.status(500).json({ error: err.message });
  }
}

// Listar todos os usuários
async function listarUsuarios(req, res) {
  try {
    const users = await userService.listarUsuarios();
    res.status(200).json(users);
  } catch (err) {
    console.error("[Controller] Erro ao listar usuários:", err);
    res.status(500).json({ error: err.message });
  }
}

// Atualizar usuário
async function atualizarUsuarioMe(req, res) {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: true, message: "Não autenticado" });
    }
    const user = await userService.atualizarUsuario(req.user.uid, req.body);
    return res.json({ user });
  } catch (e) {
    return res.status(e.status || 400).json({ error: true, message: e.message });
  }
}

// Deletar usuário
async function deletarUsuario(req, res) {
  try {
    const result = await userService.deletarUsuario(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    console.error("[Controller] Erro ao deletar usuário:", err);
    res.status(404).json({ error: err.message });
  }
}

// Estatísticas do usuário
async function getUserStats(req, res) {
  try {
    const stats = await userService.getUserStats(req.params.id);
    res.status(200).json(stats);
  } catch (err) {
    console.error("[Controller] Erro ao obter estatísticas do usuário:", err);
    res.status(500).json({ error: err.message });
  }
}

// Exporta todas as funções
module.exports = {
  buscarUsuarioPorFirebaseUid,
  criarUsuario,
  listarUsuarios,
  atualizarUsuarioMe,
  deletarUsuario,
  getUserStats,
};
