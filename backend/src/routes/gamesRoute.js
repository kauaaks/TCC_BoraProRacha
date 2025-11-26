const express = require("express");
const router = express.Router();

const gamesController = require("../controllers/gamesController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

// lista todos os jogos do representante
router.get("/", verifyFirebaseToken, gamesController.listarJogos);

// criar jogo
router.post("/", verifyFirebaseToken, gamesController.criarJogo);

// aceitar / cancelar / finalizar
router.post("/:id/accept", verifyFirebaseToken, gamesController.aceitarJogo);
router.post("/:id/cancel", verifyFirebaseToken, gamesController.cancelarJogo);
router.post("/:id/finish", verifyFirebaseToken, gamesController.marcarTerminado);

// NOVO: definir resultado (gols + vencedor/empate)
router.put("/:id/result", verifyFirebaseToken, gamesController.definirResultado);

// listar por status
router.get("/status", verifyFirebaseToken, gamesController.listarJogosPorStatus);

module.exports = router;
