const express = require("express");
const router = express.Router();

const team_membersController = require("../controllers/team_membersController");

router.get("/", team_membersController.listarMembros);
router.get("/:id", team_membersController.buscarMembro);
router.post("/", team_membersController.criarMembro);
router.put("/:id", team_membersController.atualizarMembro);
router.delete("/:id", team_membersController.deletarMembro);

module.exports = router;
