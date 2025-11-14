const mongoose = require("mongoose");

const teamsSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  description: { type: String, required: true },
  monthly_fee: { type: Number, required: true },
  created_by: { 
    uid: { type: String, required: true }, // Firebase UID
    user_type: { type: String, required: true, enum: ["admin", "representante_time", "gestor_campo"] }
  },
  members: [
    {
      uid: { type: String, required: true },       // Firebase UID do membro
      user_type: { type: String, required: true, enum: ["admin", "representante_time", "gestor_campo", "jogador"] } // adiciona tipo jogador se necessário
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.Times || mongoose.model("Times", teamsSchema);