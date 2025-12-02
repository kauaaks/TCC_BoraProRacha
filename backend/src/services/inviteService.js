const crypto = require("crypto");
const QRCode = require("qrcode");
const Invite = require("../models/invite");
const Teams = require("../models/teams");
const Users = require("../models/user");
const payments = require("../models/payments");
const mongoose = require("mongoose");

function toYearMonth(d) {
  const dt = new Date(d || Date.now());
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function gerarTokenConvite(timeId) {
  if (!timeId) throw new Error("timeId é obrigatório");
  if (!mongoose.Types.ObjectId.isValid(timeId)) throw new Error("timeId inválido");

  const agora = new Date();
  let inviteExistente = await Invite.findOne({
    timeId,
    usado: false,
    $or: [{ expiraEm: { $exists: false } }, { expiraEm: { $gt: agora } }]
  });

  if (!inviteExistente) {
    let token;
    for (;;) {
      token = crypto.randomBytes(12).toString("hex");
      const jaExiste = await Invite.exists({ token });
      if (!jaExiste) break;
    }
    inviteExistente = await Invite.create({
      token,
      timeId,
      expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }

  const origin = process.env.APP_ORIGIN || "http://localhost:5173";
  const url = `${origin}/convite/${inviteExistente.token}`;
  const qrCode = await QRCode.toDataURL(url);

  return {
    token: inviteExistente.token,
    url,
    qrCode,
    expiraEm: inviteExistente.expiraEm
  };
}

async function entrarNoTime(uid, token) {
  if (!uid) throw new Error("uid ausente");
  if (!token) throw new Error("token é obrigatório");

  const invite = await Invite.findOne({ token });
  if (!invite) throw new Error("Convite inválido");
  if (invite.usado) throw new Error("Convite já utilizado");
  if (invite.expiraEm && invite.expiraEm <= new Date()) throw new Error("Convite expirado");

  const team = await Teams.findById(invite.timeId);
  if (!team) throw new Error("Time não encontrado");

  const already = Array.isArray(team.members) && team.members.some(m => (m?.uid || m) === uid);

  if (!already) {
    team.members = Array.isArray(team.members) ? team.members : [];
    team.members.push({ uid, user_type: "jogador" });
    await team.save();
  }

  invite.usado = true;
  await invite.save();

  try {
    const month = toYearMonth(Date.now());
    const due = new Date(`${month}-15T03:00:00.000Z`);

    const u = await Users.findOne({ firebaseUid: uid }).select('_id').lean();
    if (u && u._id) {
      await payments.findOneAndUpdate(
        { team_id: team._id, user_id: u._id, month },
        {
          $setOnInsert: {
            amount: team.monthly_fee || 0,
            due_date: due,
            status: 'pending',
            receipt_url: null,
            payment_method: null
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  } catch (e) {
    console.warn("[inviteService] upsert ciclo pagamento falhou:", e?.message);
  }

  return { ok: true, teamId: String(team._id) };
}

module.exports = { gerarTokenConvite, entrarNoTime };
