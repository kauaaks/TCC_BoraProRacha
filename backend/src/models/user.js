const mongoose = require("mongoose");
const bcrypt = require ("bcrypt");

const userSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    email: {type: String, required:true, unique:true},
    senha: {type: String, required:true},
    telefone: {type: Number, required:true},
    ativo: {type: Boolean, default:true},
    user_type: {type: String, enum:["admin","jogador", "gestor de campo", "representante"]},
},{timestamps: true});

userSchema.pre("save", async function (next) {
    if (!this.isModified("senha")) return next();

    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
});

module.exports = mongoose.model("Usuários", userSchema);