const fieldService = require('../services/fieldService');

async function listarCampos(req, res) {
    try {
        const fields = await fieldService.listarCampos();
        res.json(fields);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
}

async function buscarCampo(req, res) {
    try {
        const field = await fieldService.buscarCampo(req.params.id);
         res.status(200).json(field);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}

async function criarCampo(req, res) {
    try {
        const novoCampo = await fieldService.criarCampo(req.body);
        res.status(201).json(novoField);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function atualizarCampo(req, res) {
    try {
        const field = await fieldService.atualizarCampo(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json(field);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function deletarCampo(req, res) {
    try {
        const field = await fieldService.deletarCampo(req.params.id);
        res.status(200).json(field);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }   
}

module.exports = {
    listarCampos,
    buscarCampo,
    criarCampo,
    atualizarCampo,
    deletarCampo
};