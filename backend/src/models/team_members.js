const mongoose = require("mongoose");

const team_membersSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "Usuários", required: true},
    team_id: {type: mongoose.Schema.Types.ObjectId, ref: "Times", required: true},
    role: {type: String, required: true},
    joined_at: {type: Date, default: Date.now},
    monthly_payment_status: {type: String, enum: ["paid", "unpaid"], default: "unpaid"},
}, {timestamps: true});

module.exports = mongoose.models.MembrosDeTime || mongoose.model("MembrosDeTime", team_membersSchema);