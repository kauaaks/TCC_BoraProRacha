const perfilService = require("../services/perfilService");

async function updateAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;

    const result = await perfilService.updateAvatar({
      firebaseUid: req.user.uid,
      avatarRelativePath,
    });

    return res.status(200).json({
      success: true,
      user: result,
    });
  } catch (err) {
    console.error("[AccountController] Erro em updateAvatar:", err);
    return res.status(500).json({ error: "Erro ao atualizar avatar" });
  }
}

module.exports = {
  updateAvatar,
};
