const express = require("express");
const router = express.Router();

const teamsController = require("../controllers/teamsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

// Rotas específicas e sem parâmetros primeiro
router.get("/", teamsController.listarTimes);
router.get("/me", verifyFirebaseToken, teamsController.meuTime);        // lista do usuário (por UID)
router.get("/meustimes", verifyFirebaseToken, teamsController.meusTimes); // mesma lista do usuário

// Rotas com segmentos fixos antes das paramétricas
router.get("/:id/members", verifyFirebaseToken, teamsController.listarMembrosTime);
router.post("/", verifyFirebaseToken, teamsController.criarTime);
router.put("/:id", verifyFirebaseToken, teamsController.atualizarTime);
router.delete("/:id", verifyFirebaseToken, teamsController.deletarTime);

// Rota paramétrica por último (busca por ID)
router.get("/:id", teamsController.buscarTime);

module.exports = router;
