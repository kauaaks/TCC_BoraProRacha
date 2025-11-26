const mongoose = require("mongoose");

const game_statsSchema = new mongoose.Schema(
  {
    game_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jogos",
      required: true,
    },

    // Jogador dono da estatística (sempre firebaseUid)
    firebaseUid: {
      type: String,
      required: true,
    },

    // Estatísticas simples por jogo
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },

    // Controle de origem/validação
    from_player: { type: Boolean, default: true },      // true se foi o jogador que enviou
    confirmed_by_rep: { type: Boolean, default: false } // true quando o representante confirmar
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.EstatisticasDeJogos ||
  mongoose.model("EstatisticasDeJogos", game_statsSchema);

