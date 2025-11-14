const admin = require('../config/firebase');

async function verifyFirebaseToken(req, res, next) {
  console.log("Middleware ativado");
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token ausente ou inválido" });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    // Dados do usuário decodificado (uid, email, etc)
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erro na verificação do token:", err.message);
    res.status(403).json({ message: "Token inválido ou expirado" });
  }
}

module.exports = { verifyFirebaseToken };
