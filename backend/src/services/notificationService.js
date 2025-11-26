const Notification = require("../models/notification");
const Users = require("../models/user");
const Teams = require("../models/teams");

// Lista avisos de um time para o representante logado
async function listarAvisosDoTimeParaRep(teamId, firebaseUid) {
  if (!teamId || !firebaseUid) {
    throw new Error("Time ou usuário não informado.");
  }

  // pega o _id do usuário pelo firebaseUid
  const user = await Users.findOne({ firebaseUid }).lean();
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  // garante que o time existe (opcional, mas melhora mensagens)
  const team = await Teams.findById(teamId).lean();
  if (!team) {
    throw new Error("Time não encontrado.");
  }

  const notifications = await Notification.find({
    team_id: teamId,
    user_id: user._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return notifications.map((n) => ({
    id: String(n._id),
    title: n.title,
    message: n.message,
    viewed: n.viewed,
    created_at: n.createdAt,
  }));
}

module.exports = {
  listarAvisosDoTimeParaRep,
};
