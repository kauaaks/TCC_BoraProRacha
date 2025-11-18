const userService = require("../services/userService");

// GET /users/firebase/:uid
async function buscarUsuarioPorFirebaseUid(req, res) {
  const { uid } = req.params;
  console.log("[Controller] Buscar usuário por Firebase UID:", uid);

  try {
    // 1) Tenta no Mongo
    let user = await userService.buscarUsuarioPorFirebaseUid(uid);
    if (user) {
      console.log("[Controller] Usuário encontrado:", user);
      return res.status(200).json(user);
    }

    console.log("[Controller] Usuário não encontrado no Mongo, verificando Firebase...");

    // 2) Tenta no Firebase (UserRecord ou null)
    const firebaseUser = await userService.buscarUsuarioNoFirebase(uid);
    if (!firebaseUser) {
      return res.status(404).json({ error: "Usuário não encontrado nem no Mongo nem no Firebase" });
    }

    // 3) Normaliza campos independentemente do shape retornado pela service
    const firebaseUid = firebaseUser.uid || firebaseUser.firebaseUid || uid;
    const nome = (firebaseUser.displayName || firebaseUser.nome || "Sem nome");
    const telefone = "00000000000";
    const user_type = "jogador";

    // 4) Cria no Mongo com defaults de negócio
    const created = await userService.criarUsuario({
      firebaseUid,
      nome,
      telefone,
      user_type,
      ativo: true,
    });

    console.log("[Controller] Usuário criado no Mongo a partir do Firebase:", created);
    return res.status(201).json(created);
  } catch (err) {
    console.error("[Controller] Erro ao buscar/criar usuário:", err);
    return res.status(500).json({ error: err.message });
  }
}

// POST /users
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
    return res.status(201).json(novoUser);
  } catch (err) {
    console.error("[Controller] Erro ao criar usuário:", err);

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

    return res.status(500).json({ error: err.message });
  }
}

// GET /users
async function listarUsuarios(req, res) {
  try {
    const users = await userService.listarUsuarios();
    return res.status(200).json(users);
  } catch (err) {
    console.error("[Controller] Erro ao listar usuários:", err);
    return res.status(500).json({ error: err.message });
  }
}

// PATCH /users/me
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

// DELETE /users/:id
async function deletarUsuario(req, res) {
  try {
    const result = await userService.deletarUsuario(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[Controller] Erro ao deletar usuário:", err);
    return res.status(404).json({ error: err.message });
  }
}

// GET /users/:id/stats
async function getUserStats(req, res) {
  try {
    const stats = await userService.getUserStats(req.params.id);
    return res.status(200).json(stats);
  } catch (err) {
    console.error("[Controller] Erro ao obter estatísticas do usuário:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  buscarUsuarioPorFirebaseUid,
  criarUsuario,
  listarUsuarios,
  atualizarUsuarioMe,
  deletarUsuario,
  getUserStats,
};
