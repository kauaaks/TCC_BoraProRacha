const express = require("express");
const router = express.Router();

const game_statsController = require("../controllers/game_statsController");


router.get("/", game_statsController.listarStatusDeJogos);
router.get("/:id", game_statsController.buscarStatusDeJogo);
router.post("/", game_statsController.criarStatusDeJogo);
router.put("/:id", game_statsController.atualizarStatusDeJogo);
router.delete("/:id", game_statsController.deletarGameStat); 
router.get("/stats/game/:game_id", game_statsController.getGameStats); 

module.exports = router;
