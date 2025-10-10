const team_memberService = require('../services/team_memberService');

async function listarMembros(req, res) {
    try {
        const membros = await team_memberService.listarMembros();
        res.json(membros);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function buscarMembro(req, res) {
    try {
        const membro = await team_memberService.buscarMembro(req.params.id);
        res.status(200).json(membro);
    } catch (err) {
        res.status(404).json({error: err.message});
    }
} 

async function criarMembro(req, res) {
    try {
        const novoMembro = await team_memberService.criarMembro(req.body);
        res.status(201).json(novoMembro);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

async function atualizarMembro(req, res) {
    try {
        const membro = await team_memberService.atualizarMembro(req.params.id, req.body, {new: true, runValidators: true});

        if (!membro) return res.status(404).json({error: "Membro não encontrado"});
        res.json(membro);
    } catch (err) {
        res.status(500).json({error: err.message});
    }       
}

async function deletarMembro(req, res) {
    try {
        const membro = await TeamMember.findByIdAndDelete(req.params.id);
        res.status(200).json(membro);
    } catch (err) {
        res.status(404).json({error: err.message});
    } 
}

module.exports = {
    listarMembros,
    buscarMembro,
    criarMembro,
    atualizarMembro,
    deletarMembro
};
