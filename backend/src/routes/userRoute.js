const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const user = require("../models/user");

router.get("/", userController.listarUsuarios);
router.get("/:id", userController.buscarUsuario);
router.post("/", userController.criarUsuario);
router.put("/:id", userController.atualizarUsuario);
router.delete("/:id", userController.deletarUsuario);

module.exports = router;
