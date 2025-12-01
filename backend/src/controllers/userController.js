const userService = require("../services/userService");

async function listarUsuarios(req, res) {
  try {
    const users = await userService.listarUsuarios();
    return res.status(200).json(users);
  } catch (err) {
    console.error("[Controller listarUsuarios] Erro:", err);
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}

async function criarUsuario(req, res) {
  try {
    const result = await userService.criarUsuario(req.body);
    return res.status(201).json(result);
  } catch (err) {
    console.error("[Controller criarUsuario] Erro:", err);
    return res.status(400).json({ error: err.message || "Erro interno" });
  }
}

async function atualizarUsuarioMe(req, res) {
  try {
    const firebaseUidAutenticado = req.user?.uid;
    const novosDados = req.body;

    const user = await userService.atualizarUsuario(
      firebaseUidAutenticado,
      novosDados
    );

    return res.status(200).json(user);
  } catch (err) {
    console.error("[Controller atualizarUsuarioMe] Erro:", err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Erro interno" });
  }
}

async function deletarUsuario(req, res) {
  try {
    const { id } = req.params;
    const result = await userService.deletarUsuario(id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[Controller deletarUsuario] Erro:", err);
    return res.status(400).json({ error: err.message || "Erro interno" });
  }
}

async function getUserStats(req, res) {
  try {
    const { uid } = req.params;
    const stats = await userService.getUserStats(uid);
    return res.status(200).json(stats);
  } catch (err) {
    console.error("[Controller getUserStats] Erro:", err);
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}

async function buscarUsuarioPorFirebaseUid(req, res) {
  try {
    const { uid } = req.params;
    const user = await userService.buscarUsuarioPorFirebaseUid(uid);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error("[Controller buscarUsuarioPorFirebaseUid] Erro:", err);
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}

async function alterarEmailMe(req, res) {
  try {
    const { newEmail } = req.body;
    const firebaseUid = req.user?.uid;

    const result = await userService.alterarEmailFirebase({
      firebaseUid,
      newEmail,
    });

    return res.status(200).json({
      message: "E-mail atualizado com sucesso. Verifique sua caixa de entrada.",
      user: result,
    });
  } catch (err) {
    console.error("[Controller alterarEmailMe] Erro:", err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Erro interno" });
  }
}

module.exports = {
  listarUsuarios,
  criarUsuario,
  atualizarUsuarioMe,
  deletarUsuario,
  getUserStats,
  buscarUsuarioPorFirebaseUid,
  alterarEmailMe,
};
