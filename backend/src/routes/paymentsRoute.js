const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const paymentsController = require("../controllers/paymentsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'receipts');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.png');
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) return cb(new Error('apenas imagens são permitidas'));
    cb(null, true);
  }
});


router.get("/team/:teamId", verifyFirebaseToken, paymentsController.listarTimeMes);
router.get("/user", verifyFirebaseToken, paymentsController.listarUsuarioMes);
router.post("/mark-paid", verifyFirebaseToken, paymentsController.marcarPago);
router.post("/mark-unpaid", verifyFirebaseToken, paymentsController.marcarNaoPago);
router.post("/receipt/upload", verifyFirebaseToken, upload.single('file'), paymentsController.uploadComprovante);
router.delete("/receipt", verifyFirebaseToken, paymentsController.removerComprovante);
router.get("/", paymentsController.listarPagamentos);
router.get("/:id", paymentsController.buscarPagamento);
router.post("/", paymentsController.criarPagamento);
router.put("/:id", paymentsController.atualizarPagamento);
router.delete("/:id", paymentsController.deletarPagamento);

module.exports = router;
