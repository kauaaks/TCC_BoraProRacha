// src/controllers/teamsController.js
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
    const time = await teamsService.atualizarTime(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
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

async function monthRange(req, res) {
  try {
    const { id } = req.params;
    const range = await teamsService.monthRange(id);
    return res.json(range);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
}

// NOVO: atualizar posição de um membro do time
async function atualizarPosicaoMembro(req, res) {
  try {
    const { id, uid } = req.params;
    const { position } = req.body;

    const team = await teamsService.atualizarPosicaoMembro(id, uid, position);
    return res.status(200).json(team);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// NOVO: upload de escudo/logo (foto) do time
async function uploadEscudo(req, res) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Arquivo de escudo obrigatório" });
    }

    // A URL pública que o front vai usar:
    // se o app.js servir "/uploads" de forma estática, isso funciona:
    const escudoUrl = `/uploads/shields/${file.filename}`;

    const team = await teamsService.atualizarEscudoTime(id, escudoUrl);
    return res.status(200).json({ team });
  } catch (err) {
    console.error("Erro ao fazer upload de escudo:", err);
    return res.status(400).json({ error: err.message || "Erro ao atualizar escudo do time" });
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
  meusTimes,
  monthRange,
  atualizarPosicaoMembro,
  uploadEscudo, // 👈 novo export
};
