const express = require("express");
const router = express.Router();

const game_statsController = require("../controllers/game_statsController");

// 🔹 Lista TODAS as estatísticas individuais
router.get("/", game_statsController.listarStatusDeJogos);

// 🔹 Busca uma estatística específica pelo ID do documento
router.get("/:id", game_statsController.buscarStatusDeJogo);

// 🔹 Cria uma nova estatística
router.post("/", game_statsController.criarStatusDeJogo);

// 🔹 Atualiza uma estatística existente
router.put("/:id", game_statsController.atualizarStatusDeJogo);

// 🔹 Deleta uma estatística específica
router.delete("/:id", game_statsController.deletarGameStat);

// 🔹 Obtém estatísticas GERAIS de um jogo específico (totais e médias)
router.get("/stats/:game_id", game_statsController.getGameStats);

module.exports = router;
