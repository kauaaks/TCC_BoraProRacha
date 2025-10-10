const teamMembers = require('../models/team_members');

async function listarMembros() {
    return await teamMembers.find();
}

async function buscarMembro(id) {
    const membro = await teamMembers.findById(id);
    if (!membro) throw new Error("membro não encontrado.");
    return membro;
}

async function criarMembro(dados) {
    const { user_id, team_id, role, joined_at, monthly_payment_status} = dados;
    if (!user_id || !team_id || !role || !joined_at || !monthly_payment_status)
        throw new Error("preencha todos os campos obrigatórios.");
    const jaExiste = await teamMembers.findOne({user_id, team_id});
    if (jaExiste) throw new Error("membro ja cadastrado nesse time.");
    const novoMembro = await teamMembers.create({
        user_id,
        team_id,
        role,
        joined_at,
        monthly_payment_status
    
    });
    return novoMembro;
}

async function atualizarMembro(id, novosDados) {
    const membro = await teamMembers.findByIdAndUpdate(id, novosDados, {
        new: true,
        runValidators: true
    });
    if (!membro) throw new Error("membro não encontrado.");
    return membro;
}

async function deletarMembro(id) {
    const membro = await teamMembers.findByIdAndDelete(id);
    if (!membro) throw new Error("membro não encontrado.");
    return { message: "membro deletado com sucesso."};
}

module.exports = {
    listarMembros,
    buscarMembro,
    criarMembro,
    atualizarMembro,
    deletarMembro
};