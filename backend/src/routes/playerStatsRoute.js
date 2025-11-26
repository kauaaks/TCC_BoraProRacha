const express = require("express");
const router = express.Router();

const { getMyPlayerStats } = require("../controllers/playerStatsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

router.get("/me", verifyFirebaseToken, getMyPlayerStats);

module.exports = router;
