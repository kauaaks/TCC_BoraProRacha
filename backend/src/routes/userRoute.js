const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");
const { attachUserRole } = require("../middlewares/attachUserRole");
const { checkRole } = require("../middlewares/checkRole");

router.get("/usuarios", verifyFirebaseToken, attachUserRole, checkRole(["admin"]), userController.listarUsuarios);
router.get("/:id", userController.buscarUsuario);
router.post("/", userController.criarUsuario);
router.put("/:id", userController.atualizarUsuario);
router.delete("/:id", userController.deletarUsuario);
router.get("/:id/stats", userController.getUserStats);

module.exports = router;
