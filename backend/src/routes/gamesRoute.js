const express = require("express");
const router = express.Router();

const gamesController = require("../controllers/gamesController");

router.get("/", gamesController.listarJogos);
router.get("/:id", gamesController.buscarJogo);
router.post("/", gamesController.criarJogo);
router.put("/:id", gamesController.atualizarJogo);
router.delete("/:id", gamesController.deletarJogo);

module.exports = router;
