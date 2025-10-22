const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { attachUserRole } from "../middlewares/attachUserRole.js";
import { checkRole } from "../middlewares/checkRole.js";

router.get("/usuarios", verifyFirebaseToken, attachUserRole, checkRole(["admin"]), userController.listarUsuarios);
router.get("/:id", userController.buscarUsuario);
router.post("/", userController.criarUsuario);
router.put("/:id", userController.atualizarUsuario);
router.delete("/:id", userController.deletarUsuario);

module.exports = router;
