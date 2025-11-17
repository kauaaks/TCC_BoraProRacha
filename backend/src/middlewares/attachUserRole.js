const User = require("../models/user.js");

async function attachUserRole(req, res, next) {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  req.user.role = user.user_type; 
  next();
}

module.exports = { attachUserRole };
