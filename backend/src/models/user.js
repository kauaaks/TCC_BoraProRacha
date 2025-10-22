const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: Number, required: true },
  ativo: { type: Boolean, default: true },
  user_type: { 
    type: String, 
    enum: ["admin", "jogador", "gestor de campo", "representante"], 
    required: true 
  },
  firebaseUid: { type: String, required: true, unique: true }, // ID do Firebase
}, { timestamps: true });

/* "mongoose.models.Usuários" verifica se o modelo já foi registrado. */
module.exports = mongoose.models.Usuários || mongoose.model("Usuários", userSchema);
