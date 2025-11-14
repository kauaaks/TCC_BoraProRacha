const express = require("express");
const router = express.Router();

const teamsController = require("../controllers/teamsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

router.get("/", teamsController.listarTimes);
router.get("/me", verifyFirebaseToken, teamsController.meuTime);
router.get("/:id", teamsController.buscarTime);
router.post("/", verifyFirebaseToken, teamsController.criarTime);
router.put("/:id",verifyFirebaseToken, teamsController.atualizarTime);
router.get("/:id/members", verifyFirebaseToken, teamsController.listarMembrosTime);
router.delete("/:id",verifyFirebaseToken, teamsController.deletarTime);

module.exports = router;