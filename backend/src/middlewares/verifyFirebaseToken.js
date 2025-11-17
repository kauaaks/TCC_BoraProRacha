const admin = require('../config/firebase');
const Users = require('../models/user'); 
const USERS_UID_FIELD = 'firebaseUid';

async function verifyFirebaseToken(req, res, next) {
  console.log("Middleware ativado");
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token ausente ou inválido" });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const user = await Users.findOne({ [USERS_UID_FIELD]: uid })
      .select('_id user_type nome email') 
      .lean();

    
    req.user = {
      uid,
      ...(decoded || {}),
      ...(user ? { id: String(user._id), _id: user._id, user_type: user.user_type, nome: user.nome, email: user.email } : {})
    };

    next();
  } catch (err) {
    console.error("Erro na verificação do token:", err.message);
    res.status(403).json({ message: "Token inválido ou expirado" });
  }
}

module.exports = { verifyFirebaseToken };
