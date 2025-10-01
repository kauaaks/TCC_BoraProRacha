const TeamMember = require('../models/team_members');

async function listarMembros(req, res) {
    try {
        const membros = await TeamMember.find();
        res.json(membros);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function buscarMembro(req, res) {
    try {
        const membro = await TeamMember.findById(req.params.id);
        res.json(membro);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
} 

async function criarMembro(req, res) {
    try {
        const { team_id, user_id, role, joined_at, monthly_payment_status } = req.body;
        const novoMembro = new TeamMember({ team_id, user_id, role, joined_at, monthly_payment_status});
        await novoMembro.save();
        res.status(201).json(novoMembro);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function atualizarMembro(req, res) {
    try {
        const membro = await TeamMember.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        if (!membro) return res.status(404).json({error: "Membro não encontrado"});
        res.json(membro);
    } catch (err) {
        res.status(500).json({error: err.message});
    }       
}

async function deletarMembro(req, res) {
    try {
        const membro = await TeamMember.findByIdAndDelete(req.params.id);
        if (!membro) return res.status(404).json({error: "Membro não encontrado"});
        res.json({message: "Membro deletado com sucesso"});
    } catch (err) {
        res.status(500).json({error: err.message});
    } 
}

module.exports = {
    listarMembros,
    buscarMembro,
    criarMembro,
    atualizarMembro,
    deletarMembro
};
