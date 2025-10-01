const mongoose = require("mongoose");

const fieldsSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    address: {type: String, required:true},
    hourly_rate: {type: Number, required:true},
    facilities: {type: String, required:true},
}, {timestamps: true});

module.exports = mongoose.model("Campos", fieldsSchema);
