const crypto = require("crypto");
const QRCode = require("qrcode");
const Invite = require("../models/invite");

// Gera token, cria invite no Mongo e retorna link + QR code
async function gerarTokenConvite(timeId) {
  const token = crypto.randomBytes(12).toString("hex");

  const invite = await Invite.create({
    token,
    timeId,
    expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h de validade
  });

  const url = `http://localhost:5173/convite/${token}`;
  const qrCode = await QRCode.toDataURL(url);

  return { token, url, qrCode };
}

module.exports = { gerarTokenConvite };
