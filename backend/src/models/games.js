const mongoose = require("mongoose");

const gamesSchema = new mongoose.Schema({
  teams_id: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Times",
    required: true
  },
  field_id: { type: String, required: true },

  scheduled_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pendente", "aceito", "cancelado", "terminado"],
    required: true
  },
  duration: { type: String, required: true },

  invited_by: { type: String, required: true },      // uid quem convidou
  accepted_by: { type: String, default: null },      // uid representante que aceitou
  cancelled_by: { type: String, default: null },     // uid de quem cancelou
  finished_by: { type: [String], default: [] },      // uids que confirmaram terminado

  // NOVOS CAMPOS PARA RESULTADO
  goals_team1: { type: Number, default: 0 },         // time em teams_id[0]
  goals_team2: { type: Number, default: 0 },         // time em teams_id[1]
  winner_team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Times",
    default: null                                     // empate ou não definido
  }
}, { timestamps: true });

module.exports = mongoose.models.Jogos || mongoose.model("Jogos", gamesSchema);
