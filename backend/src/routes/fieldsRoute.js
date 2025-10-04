const express = require("express");
const router = express.Router();

const fieldsController = require("../controllers/fieldsController");

router.get("/", fieldsController.listarCampos);
router.get("/:id", fieldsController.buscarCampo);
router.post("/", fieldsController.criarCampo);
router.put("/:id", fieldsController.atualizarCampo);
router.delete("/:id", fieldsController.deletarCampo);

module.exports = router;
