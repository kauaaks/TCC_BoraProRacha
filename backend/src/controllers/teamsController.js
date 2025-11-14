const teamsService = require('../services/teamService');
const Users = require('../models/user.js');

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
    const uid = req.user.uid;

    // Busca o user no Mongo
    const user = await Users.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado no banco" });

    // Monta os dados que a service precisa
    const dados = {
      ...req.body,
      created_by: { uid, user_type: user.user_type },
      members: [{ uid, user_type: user.user_type }]
    };

    // Chama a service passando o objeto já completo
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

async function meuTime(req, res) {
  try {
    const uid = req.user.uid;
    console.log("[meuTime] --- Início da execução ---");
    console.log("[meuTime] UID do usuário logado:", uid, "| tipo:", typeof uid);

    const team = await teamsService.meuTime(uid);
    console.log("[meuTime] Time retornado pelo service:", team);
    console.log("[meuTime] Tipo do time retornado:", typeof team);

    if (!team) {
      console.log("[meuTime] Nenhum time encontrado para este UID");
      return res.status(404).json({ error: 'Nenhum time vinculado a este usuário' });
    }

    console.log("[meuTime] Enviando resposta com o time encontrado");
    res.json({ team });
    console.log("[meuTime] --- Fim da execução ---");
  } catch (err) {
    console.error("[meuTime] Erro capturado:", err);
    res.status(500).json({ error: 'Erro ao buscar time' });
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
    deletarTime,
    meuTime,
    listarMembrosTime
};
