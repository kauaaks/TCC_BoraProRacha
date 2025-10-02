const Fields = require('../models/fields');

async function listarCampos(req, res) {
    try {
        const fields = await Fields.find();
        res.json(fields);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
}

async function buscarCampo(req, res) {
    try {
        const field = await Fields.findById(req.params.id);
        if (!field) return res.status(404).json({ error: 'Campo não encontrado' });
        res.json(field);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function criarCampo(req, res) {
    try {
        const { nome, address, hourly_rate, facilities } = req.body;
        const novoField = new Fields({ nome, address, hourly_rate, facilities });
        await novoField.save();
        res.status(201).json(novoField);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function atualizarCampo(req, res) {
    try {
        const field = await Fields.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!field) return res.status(404).json({ error: 'Campo não encontrado' });
        res.json(field);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function deletarCampo(req, res) {
    try {
        const field = await Fields.findByIdAndDelete(req.params.id);
        if (!field) return res.status(404).json({ error: 'Campo não encontrado' });
        res.json({ message: 'Campo deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
}

module.exports = {
    listarCampos,
    buscarCampo,
    criarCampo,
    atualizarCampo,
    deletarCampo
};