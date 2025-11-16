const express = require("express");
const router = express.Router();
const { gerarConvite, entrarNoTime } = require("../controllers/inviteController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

router.post("/gerar-convite", verifyFirebaseToken, gerarConvite);
router.post("/entrar-time", verifyFirebaseToken, entrarNoTime);

module.exports = router;
