const express = require("express");
const router = express.Router();

const teamsController = require("../controllers/teamsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

router.get("/", teamsController.listarTimes);
router.get("/me", verifyFirebaseToken, teamsController.meuTime);
router.get("/meustimes", verifyFirebaseToken, teamsController.meusTimes);
router.get("/:id/members", verifyFirebaseToken, teamsController.listarMembrosTime);
router.post("/", verifyFirebaseToken, teamsController.criarTime);
router.put("/:id", verifyFirebaseToken, teamsController.atualizarTime);
router.delete("/:id", verifyFirebaseToken, teamsController.deletarTime);
router.get("/:id/month-range", teamsController.monthRange);
router.get("/:id", teamsController.buscarTime);

module.exports = router;
