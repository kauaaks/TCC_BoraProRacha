const teamsService = require('../services/teamService');
const Users = require('../models/user.js');

async function listarTimes(req, res) {
  try {
    const teams = await teamsService.listarTimes();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function buscarTime(req, res) {
  try {
    const team = await teamsService.buscarTime(req.params.id);
    res.status(200).json(team);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function criarTime(req, res) {
  try {
    const uid = req.user.uid;

    const user = await Users.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado no banco" });

    const dados = {
      ...req.body,
      created_by: { uid, user_type: user.user_type },
      members: [{ uid, user_type: user.user_type }]
    };

    const novoTime = await teamsService.criarTime(dados);
    res.status(201).json(novoTime);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function listarMembrosTime(req, res) {
  try {
    const { id } = req.params;
    const members = await teamsService.listarMembrosTime(id);
    return res.status(200).json({ members });
  } catch (error) {
    console.error("Erro ao listar membros do time:", error);
    return res.status(400).json({ message: error.message });
  }
}

async function meusTimes(req, res) {
  try {
    const uid = req.user.uid;
    const teams = await teamsService.timeUid(uid);
    return res.json({ teams });
  } catch (err) {
    console.error("[/teams/me|/meustimes] erro:", err);
    return res.status(500).json({ error: "Erro ao buscar times do usuário" });
  }
}

async function meuTime(req, res) {
  try {
    const uid = req.user.uid;
    console.log("[/teams/me|meustimes] uid:", uid);
    const teams = await teamsService.timeUid(uid);
    return res.json({ teams });
  } catch (err) {
    console.error("[/teams/me|meustimes] stack:", err);
    return res.status(500).json({ error: "Erro ao buscar times do usuário" });
  }
}

async function atualizarTime(req, res) {
  try {
    const time = await teamsService.atualizarTime(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(time);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deletarTime(req, res) {
  try {
    const time = await teamsService.deletarTime(req.params.id);
    res.status(200).json(time);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = {
  listarTimes,
  buscarTime,
  criarTime,
  atualizarTime,
  deletarTime,
  meuTime,
  listarMembrosTime,
  meusTimes
};
