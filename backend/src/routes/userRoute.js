const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");
const { attachUserRole } = require("../middlewares/attachUserRole");
const { checkRole } = require("../middlewares/checkRole");

// Listar todos usuários (admin)
router.get("/usuarios", verifyFirebaseToken, attachUserRole, checkRole(["admin"]), userController.listarUsuarios);

// Buscar usuário pelo firebaseUid
router.get("/firebase/:uid", verifyFirebaseToken, userController.buscarUsuarioPorFirebaseUid);

// Criar usuário
router.post("/", userController.criarUsuario);

// Atualizar usuário
router.put("/:id", userController.atualizarUsuario);

// Deletar usuário
router.delete("/:id", userController.deletarUsuario);

// Estatísticas do usuário
router.get("/:uid/stats", userController.getUserStats);

module.exports = router;
