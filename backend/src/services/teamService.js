const teams = require('../models/teams');

async function listarTimes() {
    return await teams.find();
}

async function buscarTime(id) {
    const team = await teams.findById(id);
    if (!team) throw new Error("time não encontrado.");
    return team;
}

async function criarTime(dados) {
    const { nome, description, logo_url, created_by, monthly_fee } = dados;
    if (!nome || !description || !logo_url || !created_by || !monthly_fee) 
        throw new Error("Preencha todos os campos obrigatórios.");
    const jaExiste = await teams.findOne ({nome});
    if (jaExiste) throw new Error("time ja cadastrado com esse nome.");
    const novoTime = await teams.create({
        nome,
        description,
        logo_url,
        created_by,
        monthly_fee
    });
    return novoTime;
}

async function atualizarTime(id, NovosDados) {
    const team = await teams.findByIdAndUpdate(id, NovosDados, {
        new: true,
        runValidators: true
    });

    if (!team) throw new Error("time não encontrado.");
    return team;
}

async function deletarTime(id) {
    const team = await teams.findByIdAndDelete(id);
    if (!team) throw new Error("time não encontrado.");
    return { message: "time deletado com sucesso."};
}

module.exports = {
    listarTimes,
    buscarTime,
    criarTime,
    atualizarTime,
    deletarTime
};
