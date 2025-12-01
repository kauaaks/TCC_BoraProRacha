const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");
const { attachUserRole } = require("../middlewares/attachUserRole");
const { checkRole } = require("../middlewares/checkRole");

router.get("/usuarios", verifyFirebaseToken, attachUserRole, checkRole(["admin"]),
  userController.listarUsuarios
);
router.get("/firebase/:uid", verifyFirebaseToken, userController.buscarUsuarioPorFirebaseUid);
router.post("/", userController.criarUsuario);
router.put("/me", verifyFirebaseToken, userController.atualizarUsuarioMe);
router.put("/me/email", verifyFirebaseToken, userController.alterarEmailMe);
router.delete("/:id", userController.deletarUsuario);
router.get("/:uid/stats", userController.getUserStats);

module.exports = router;
