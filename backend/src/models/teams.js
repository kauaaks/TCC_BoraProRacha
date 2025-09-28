const moongose = require ("mongoose");

const teamsSchema = new mongoose.schema({
    nome: {type: String, required: true},
    description: {type: String, required:true},
    logo_url: {type: String, required:true},
    created_by: {type: String, enum: "representante"},
    monthly_fee: {type: Number, required:true},
}, {timestamps: true});

module.exports = moongose.model("Times", teamsSchema);