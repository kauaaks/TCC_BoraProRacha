const panelaoService = require('../services/panelaoService');

async function criarPanelao(req, res) {
  try {
    const { teamId } = req.params;
    const uid = req.user?.uid;
    const { nTimes, is_tournament, scheduled_date, duration, place, note } = req.body;

    // Corrigido: apenas log do valor ou tipo, sem chamar toISOString
    console.log('[BACK] Payload panelão:', { 
      nTimes, 
      is_tournament, 
      scheduled_date 
    });

    const novoPanelao = await panelaoService.criarPanelao(teamId, {
      nTimes,
      is_tournament,
      scheduled_date,
      duration,
      invited_by: uid,
      place,
      note,
    });

    console.log('[BACK] ✅ Panelão criado:', novoPanelao._id, { nTimes, is_tournament });
    res.status(201).json(novoPanelao);
  } catch (error) {
    console.error("Erro ao criar panelão:", error);
    res.status(400).json({ message: error.message || "Erro ao criar panelão" });
  }
}

async function listarPaneloes(req, res) {
  try {
    const { teamId } = req.params;
    const paneloes = await panelaoService.listarPaneloes(teamId);
    res.json(paneloes);
  } catch (error) {
    console.error("Erro ao listar panelões:", error);
    res.status(500).json({ message: error.message || "Erro ao listar panelões" });
  }
}

async function salvarSorteio(req, res) {
  try {
    const { id } = req.params;
    const { squads } = req.body;
    const uid = req.user?.uid;

    console.log('[BACK] Salvando sorteio:', id, 'com', squads.length, 'times');

    const panelao = await panelaoService.salvarSorteio(id, squads, uid);
    console.log('[BACK] ✅ Sorteio salvo:', { id, nTimes: squads.length, hasTournament: !!panelao.tournament });
    res.json(panelao);
  } catch (error) {
    console.error("Erro ao salvar sorteio:", error);
    res.status(error.message === "Panelão não encontrado" ? 404 : 500).json({ 
      message: error.message || "Erro ao salvar sorteio" 
    });
  }
}

async function registrarPlacar(req, res) {
  try {
    const { id } = req.params;
    const { goals_team1, goals_team2, winner_squad_index } = req.body;
    const uid = req.user?.uid;

    const panelao = await panelaoService.registrarPlacar(id, {
      goals_team1,
      goals_team2,
      winner_squad_index
    }, uid);

    res.json(panelao);
  } catch (error) {
    console.error("Erro ao registrar placar:", error);
    res.status(error.message === "Panelão não encontrado" ? 404 : 400).json({ 
      message: error.message || "Erro ao registrar placar" 
    });
  }
}

async function atualizarPartidaTorneio(req, res) {
  try {
    const { id } = req.params;
    const { matchIndex, goals_team1, goals_team2, winner_squadIndex } = req.body;
    const uid = req.user?.uid;

    const panelao = await panelaoService.atualizarPartidaTorneio(id, {
      matchIndex,
      goals_team1,
      goals_team2,
      winner_squadIndex
    }, uid);

    res.json(panelao);
  } catch (error) {
    console.error("Erro ao atualizar partida:", error);
    res.status(error.message === "Panelão não encontrado" ? 404 : 400).json({ 
      message: error.message || "Erro ao atualizar partida" 
    });
  }
}

async function finalizarTorneio(req, res) {
  try {
    const { id } = req.params;
    const { champion_squadIndex, second_squadIndex, third_squadIndex } = req.body;
    const uid = req.user?.uid;

    const panelao = await panelaoService.finalizarTorneio(id, {
      champion_squadIndex,
      second_squadIndex,
      third_squadIndex
    }, uid);

    res.json(panelao);
  } catch (error) {
    console.error("Erro ao finalizar torneio:", error);
    res.status(error.message === "Panelão não encontrado" ? 404 : 400).json({ 
      message: error.message || "Erro ao finalizar torneio" 
    });
  }
}

async function finalizarPanelao(req, res) {
  try {
    const { id } = req.params;
    const uid = req.user?.uid;

    const panelao = await panelaoService.finalizarPanelao(id, uid);
    res.json(panelao);
  } catch (error) {
    console.error("Erro ao finalizar panelão:", error);
    res.status(error.message === "Panelão não encontrado" ? 404 : 500).json({ 
      message: error.message || "Erro ao finalizar panelão" 
    });
  }
}

async function buscarPanelaoPorId(req, res) {
  try {
    const { id } = req.params;
    const panelao = await panelaoService.buscarPanelaoPorId(id);
    res.json(panelao);
  } catch (error) {
    console.error("Erro ao buscar panelão:", error);
    const status = error.statusCode || (error.message === "Panelão não encontrado" ? 404 : 500);
    res.status(status).json({ message: error.message || "Erro ao buscar panelão" });
  }
}

module.exports = {
  criarPanelao,
  listarPaneloes,
  salvarSorteio,
  finalizarPanelao,
  registrarPlacar,
  atualizarPartidaTorneio,
  finalizarTorneio,
  buscarPanelaoPorId
};
