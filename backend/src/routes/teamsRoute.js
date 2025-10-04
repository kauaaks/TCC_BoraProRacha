const express = require("express");
const router = express.Router();

const teamsController = require("../controllers/teamsController");

router.get("/", teamsController.listarTimes);
router.get("/:id", teamsController.buscarTime);
router.post("/", teamsController.criarTime);
router.put("/:id", teamsController.atualizarTime);
router.delete("/:id", teamsController.deletarTime);

module.exports = router;