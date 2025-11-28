const express = require("express");
const router = express.Router();

const adminStatsController = require("../controllers/adminStatsController");
const { verifyFirebaseToken } = require("../middlewares/verifyFirebaseToken");
const { attachUserRole } = require("../middlewares/attachUserRole");
const { checkRole } = require("../middlewares/checkRole");

const adminAuth = [
  verifyFirebaseToken,
  attachUserRole,
  checkRole(["admin"]),
];

router.get("/stats/overview", adminAuth, adminStatsController.getOverview);

router.get("/stats/regions", adminAuth, adminStatsController.getTeamsByRegion);

router.get(
  "/stats/regions/:region",
  adminAuth,
  adminStatsController.getRegionDetail
);

module.exports = router;
