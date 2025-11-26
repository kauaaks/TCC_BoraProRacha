const express = require("express");
const router = express.Router();

const teamStatsController = require("../controllers/teamStatsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");

router.get("/:teamId", verifyFirebaseToken, teamStatsController.getTeamStats);

module.exports = router;
