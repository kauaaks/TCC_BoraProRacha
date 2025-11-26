const express = require("express");
const router = express.Router();

const gamesController = require("../controllers/gamesController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");


router.get("/", verifyFirebaseToken, gamesController.listarJogos);
router.post("/", verifyFirebaseToken, gamesController.criarJogo);
router.post("/:id/accept", verifyFirebaseToken, gamesController.aceitarJogo);
router.post("/:id/cancel", verifyFirebaseToken, gamesController.cancelarJogo);
router.post("/:id/finish", verifyFirebaseToken, gamesController.marcarTerminado);
router.put("/:id/result", verifyFirebaseToken, gamesController.definirResultado);
router.get("/status", verifyFirebaseToken, gamesController.listarJogosPorStatus);

module.exports = router;
