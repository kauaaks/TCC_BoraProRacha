const mongoose = require("mongoose");

const game_statsSchema = new mongoose.Schema(
  {
    game_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jogos",
      required: true,
    },
    firebaseUid: {
      type: String,
      required: true,
    },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    from_player: { type: Boolean, default: true },      
    confirmed_by_rep: { type: Boolean, default: false } 
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.EstatisticasDeJogos ||
  mongoose.model("EstatisticasDeJogos", game_statsSchema);

