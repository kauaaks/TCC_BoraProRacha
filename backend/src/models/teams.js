const mongoose = require("mongoose");

const teamsSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    description: { type: String, required: true },
    monthly_fee: { type: Number, required: true },

    created_by: {
      uid: { type: String, required: true },
      user_type: {
        type: String,
        required: true,
        enum: ["admin", "representante_time", "gestor_campo"],
      },
    },

    members: [
      {
        uid: { type: String, required: true },
        user_type: {
          type: String,
          required: true,
          enum: ["admin", "representante_time", "gestor_campo", "jogador"],
        },
        // NOVO: posição do jogador neste time
        // para admin/representante/gestor pode ficar undefined
        position: {
          type: String,
          enum: ["goleiro", "zagueiro", "lateral", "volante", "meia", "atacante"],
          default: "atacante",
        },
      },
    ],

    // data de referência para o próximo pagamento
    next_payment_date: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Times || mongoose.model("Times", teamsSchema);
