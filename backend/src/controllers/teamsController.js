const Teams = require("../models/teams");

async function listarTimes(req, res) {
    try {
        const teams = await Teams.find();
        res.json(teams);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function buscarTime(req, res) {
    try {
        const team = await Teams.fingById(req.params.id);
        res.json(team);
    } catch (err) {
        res.status(500).json({error:err.message});
    }
}

async function criarTime(req, res) {
    try {
      const { nome, description, logo_url, created_by, field_id, monthly_fee} = req.body;
      const novoTime = new Teams({ nome, description, logo_url, created_by, field_id, monthly_fee });
        await novoTime.save();  
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function atualizarTime(req, res) {
    try {
        const time = await Teams.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        if (!time) return res.status(404).json({error: "Time não encontrado"});

        res.json(time);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function deletarTime(req, res) {
    try {
        const time = await Teams.findByIdAndDelete(req.params.id);

        if (!time) return res.status(404).json({error: "Time não encontrado"});

        res.json({message: "Time deletado com sucesso"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

module.exports = {
    listarTimes,
    buscarTime,
    criarTime,
    atualizarTime,
    deletarTime
};