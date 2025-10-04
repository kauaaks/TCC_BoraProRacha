const express = require("express");
const router = express.Router();

const paymentsController = require("../controllers/paymentsController");

router.get("/", paymentsController.listarPagamentos);
router.get("/:id", paymentsController.buscarPagamento);
router.post("/", paymentsController.criarPagamento);
router.put("/:id", paymentsController.atualizarPagamento);
router.delete("/:id", paymentsController.deletarPagamento);

module.exports = router;
