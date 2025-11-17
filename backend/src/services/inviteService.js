const crypto = require("crypto");
const QRCode = require("qrcode");
const Invite = require("../models/invite");
const mongoose = require("mongoose");


async function gerarTokenConvite(timeId) {
  
  if (!timeId) throw new Error("timeId é obrigatório");
  if (!mongoose.Types.ObjectId.isValid(timeId)) throw new Error("timeId inválido");

  const agora = new Date();
  let inviteExistente = await Invite.findOne({
    timeId,
    usado: false,
    $or: [
      { expiraEm: { $exists: false } },
      { expiraEm: { $gt: agora } }
    ]
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

module.exports = { gerarTokenConvite };
