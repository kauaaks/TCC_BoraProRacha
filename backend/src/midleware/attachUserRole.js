// Exemplo de middleware extra
import User from "../models/userModel.js";

export async function attachUserRole(req, res, next) {
  const user = await User.findOne({ firebaseUid: req.user.uid });
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  req.user.role = user.user_type; // agora checkRole consegue ler
  next();
}
