const express = require("express");
const router = express.Router();

const game_statsController = require("../controllers/game_statsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

// Rotas mais específicas primeiro
router.get("/stats/game/:game_id", verifyFirebaseToken, game_statsController.getGameStats);

// CRUD básico de stats individuais
router.get("/", verifyFirebaseToken, game_statsController.listarStatusDeJogos);
router.get("/:id", verifyFirebaseToken, game_statsController.buscarStatusDeJogo);
router.post("/", verifyFirebaseToken, game_statsController.criarStatusDeJogo);
router.put("/:id", verifyFirebaseToken, game_statsController.atualizarStatusDeJogo);
router.delete("/:id", verifyFirebaseToken, game_statsController.deletarGameStat);

module.exports = router;
