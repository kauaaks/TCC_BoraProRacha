const mongoose = require("mongoose");
const { gerarTokenConvite, entrarNoTime } = require("../services/inviteService");
const Invite = require("../models/invite");
const Teams = require("../models/teams");

// Mantém apenas req/res; delega toda a lógica à service

async function gerarConvite(req, res) {
  try {
    const uid = req.user?.uid;
    const { timeId } = req.body;

    if (!timeId) return res.status(400).json({ error: "timeId é obrigatório" });
    if (!mongoose.Types.ObjectId.isValid(timeId)) {
      return res.status(400).json({ error: "timeId inválido" });
    }

    const team = await Teams.findById(timeId).lean();
    if (!team) return res.status(404).json({ error: "Time não encontrado" });

    const isOwner = (team.created_by?.uid === uid) || (team.created_by === uid);
    const isRep = Array.isArray(team.representatives) &&
      team.representatives.some(r => (r?.uid || r) === uid);

    if (!isOwner && !isRep) {
      return res.status(403).json({ error: "Sem permissão para gerar convite" });
    }

    const invite = await gerarTokenConvite(timeId);
    return res.json({
      invite: {
        token: invite.token,
        url: invite.url,
        qrCode: invite.qrCode,
        expiraEm: invite.expiraEm
      }
    });
  } catch (e) {
    console.error("[invite/gerar] erro:", e);
    return res.status(400).json({ error: e.message || "Falha ao gerar convite" });
  }
} // [web:144]

async function entrarNoTimeController(req, res) {
  try {
    const uid = req.user?.uid;
    const { token } = req.body;
    const out = await entrarNoTime(uid, token);
    return res.json(out);
  } catch (e) {
    console.error("[invite/entrar] erro:", e);
    return res.status(400).json({ error: e.message || "Falha ao entrar no time" });
  }
} // [web:144]

module.exports = {
  gerarConvite,
  entrarNoTime: entrarNoTimeController
};
