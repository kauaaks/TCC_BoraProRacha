const teamsService = require('../services/teamService');

async function listarTimes(req, res) {
    try {
        const teams = await teamsService.listarTimes();
        res.json(teams);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

async function buscarTime(req, res) {
    try {
        const team = await teamsService.buscarTime(req.params.id);
        res.status(200).json(team);
    } catch (err) {
        res.status(404).json({error:err.message});
    }
}

async function criarTime(req, res) {
    try {
      const novoTime = await teamsService.criarTime(req.body);
      res.status(201).json(novoTime);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

async function atualizarTime(req, res) {
    try {
        const time = await teamsService.atualizarTime(req.params.id, req.body, {new: true, runValidators: true});
        res.status(200).json(time);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

async function deletarTime(req, res) {
    try {
        const time = await teamsService.deletarTime(req.params.id);
        res.status(200).json(time);
    } catch (err) {
        res.status(404).json({error: err.message});
    }
}

module.exports = {
    listarTimes,
    buscarTime,
    criarTime,
    atualizarTime,
    deletarTime
};
