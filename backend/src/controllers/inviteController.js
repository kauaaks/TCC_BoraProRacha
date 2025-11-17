const mongoose = require("mongoose");
const { gerarTokenConvite } = require("../services/inviteService");
const Invite = require("../models/invite");
const Teams = require("../models/teams");


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
}


async function entrarNoTime(req, res) {
  try {
    const uid = req.user?.uid;
    const { token } = req.body;

    if (!token) return res.status(400).json({ error: "token é obrigatório" });

    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(404).json({ error: "Convite inválido" });
    if (invite.usado) return res.status(400).json({ error: "Convite já utilizado" });
    if (invite.expiraEm && invite.expiraEm <= new Date()) {
      return res.status(400).json({ error: "Convite expirado" });
    }

    const team = await Teams.findById(invite.timeId);
    if (!team) return res.status(404).json({ error: "Time não encontrado" });

    
    const already =
      (Array.isArray(team.members) && team.members.some(m => (m?.uid || m) === uid));

    if (!already) {
      team.members = Array.isArray(team.members) ? team.members : [];
      team.members.push({ uid, user_type: "jogador" });
      await team.save();
    }

    
    invite.usado = true;
    await invite.save();

    return res.json({ ok: true, teamId: String(team._id) });
  } catch (e) {
    console.error("[invite/entrar] erro:", e);
    return res.status(400).json({ error: e.message || "Falha ao entrar no time" });
  }
}

module.exports = { 
  gerarConvite, 
  entrarNoTime 
};
