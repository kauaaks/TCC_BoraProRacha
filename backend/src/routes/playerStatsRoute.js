const express = require("express");
const router = express.Router();

const { getMyPlayerStats } = require("../controllers/playerStatsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

// estatísticas do jogador logado
router.get("/me", verifyFirebaseToken, getMyPlayerStats);

module.exports = router;
