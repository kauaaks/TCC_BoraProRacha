const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  ativo: { type: Boolean, default: true },
  user_type: { 
    type: String, 
    enum: ["admin", "jogador", "gestor_campo", "representante_time"], 
    required: true 
  },
  firebaseUid: { type: String, required: true, unique: true }, 
}, { timestamps: true });


module.exports = mongoose.models.Usuários || mongoose.model("Usuários", userSchema);
