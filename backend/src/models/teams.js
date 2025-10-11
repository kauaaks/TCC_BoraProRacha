const mongoose = require ("mongoose");

const teamsSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    description: {type: String, required:true},
    logo_url: {type: String, required:true},
    created_by: {type: String, enum: "representante"},
    monthly_fee: {type: Number, required:true},
}, {timestamps: true});

module.exports = mongoose.models.Times || mongoose.model("Times", teamsSchema);