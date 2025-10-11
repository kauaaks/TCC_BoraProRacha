const mongoose = require("mongoose");

const game_statsSchema = new mongoose.Schema({
    game_id: {type: mongoose.Schema.Types.ObjectId, ref: "Jogos", required: true},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "Usuários", required: true},
    goals: {type: Number, default: 0},
    assists: {type: Number, default: 0},
    fouls: {type: Number, default: 0},
    minutes_played: {type: Number, default: 0},
    yellow_cards: {type: Number, default: 0},
    red_cards: {type: Number, default: 0},
    attendance: {type: Boolean, default: false},
});

module.exports = mongoose.models.EstatisticasDeJogos || mongoose.model("EstatisticasDeJogos", game_statsSchema);
