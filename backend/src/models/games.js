const mongoose = require("mongoose");

const gamesSchema = new mongoose.Schema({
    teams_id: {type: [mongoose.Schema.Types.ObjectId], ref: "Times", required: true},
    field_id: {type: mongoose.Schema.Types.ObjectId, ref: "Campos", required: true},
    scheduled_date: {type: Date, required: true},
    status: {type: String, required: true},
    duration: {type: String, required: true}, // duração precisa ter formato "HH:MM:SS"
}, {timestamps: true});

module.exports = mongoose.models.Jogos || mongoose.model("Jogos", gamesSchema);