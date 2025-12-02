const notificationService = require("../services/notificationService");

async function listarAvisosDoTimeParaRep(req, res) {
  try {
    const { teamId } = req.params;
    const firebaseUid = req.user.uid;

    const avisos = await notificationService.listarAvisosDoTimeParaRep(
      teamId,
      firebaseUid
    );

    return res.status(200).json({ items: avisos });
  } catch (err) {
    console.error("[NotificationController] Erro ao listar avisos:", err);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  listarAvisosDoTimeParaRep,
};
