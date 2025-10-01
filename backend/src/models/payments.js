const mongoose = require("mongoose");

const paymentsSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "Usuários", required: true},
    team_id: {type: mongoose.Schema.Types.ObjectId, ref: "Times", required: true},
    amount: {type: Number, required: true},
    due_date: {type: Date, required: true},
    payment_date: {type: Date, default: Date.now},
    status: {type: String, enum: ["pending", "completed", "failed"], default: "pending"},
    payment_method: {type: String, enum: ["credit_card", "debit_card", "pix", "boleto"], required: true},
}, {timestamps: true});

module.exports = mongoose.model("Pagamentos", paymentsSchema);
