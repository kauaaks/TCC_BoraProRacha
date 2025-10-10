const fields = require('../models/fields');

async function listarCampos() {
    return await fields.find();
}

async function buscarCampo(id) {
    const field = await fields.findById(id);
    if (!field) throw new Error("campo não encontrado.");
    return field;
}

async function criarCampo(dados) {
    const {nome, address, hourly_rate, facilities} = dados;
    if (!nome || !address || !hourly_rate || !facilities) 
        throw new Error("Preencha todos os campos obrigatórios.");
    const jaExiste = await fields.findOne ({nome, address});
    if (jaExiste) throw new Error("campo ja cadastrado com esse nome e endereço.");
    const novoCampo = await fields.create({
        nome,
        address,
        hourly_rate,
        facilities
    });
    return novoCampo;
}

async function atualizarCampo(id, NovosDados) {
    const field = await fields.findByIdAndUpdate(id, NovosDados, {
        new: true,
        runValidators: true
    });
    if (!field) throw new Error("campo não encontrado.");
    return field;
}

async function deletarCampo(id) {
    const field = await fields.findByIdAndDelete(id);
    if (!field) throw new Error("campo não encontrado.");
    return { message: "campo deletado com sucesso."};
}

module.exports = {
    listarCampos,
    buscarCampo,
    criarCampo,
    atualizarCampo,
    deletarCampo
};